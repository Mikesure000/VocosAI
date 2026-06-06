/**
 * 通过 GitHub API 直接推送代码到仓库
 * 使用 SSH 密钥认证或 Personal Access Token
 * 
 * 用法: node push-to-github.cjs
 * 
 * 前置条件: 设置环境变量 GITHUB_TOKEN 或使用 SSH key
 */

var https = require('https');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var zlib = require('zlib');
var { execSync } = require('child_process');

var OWNER = 'Mikesure000';
var REPO = 'VocosAI';
var BRANCH = 'main';
var TOKEN = process.env.GITHUB_TOKEN || '';

if (!TOKEN) {
  console.log('ERROR: Set GITHUB_TOKEN environment variable');
  console.log('Create a token at: https://github.com/settings/tokens');
  console.log('Then run: set GITHUB_TOKEN=ghp_xxxx && node push-to-github.cjs');
  process.exit(1);
}

var PROJECT_DIR = 'E:/CodeBuddy/VocosAI';

// 需要上传的文件列表（排除 node_modules, dist, data, .env, *.sqlite）
var EXCLUDE = ['node_modules', 'dist', 'data', '.env', '.git', '*.sqlite', '*.sqlite-shm', '*.sqlite-wal', 'package-lock.json'];

function shouldInclude(filePath) {
  var rel = path.relative(PROJECT_DIR, filePath).replace(/\\/g, '/');
  if (!rel) return false;
  for (var i = 0; i < EXCLUDE.length; i++) {
    if (rel.startsWith(EXCLUDE[i]) || rel.match(EXCLUDE[i].replace(/\*/g, '.*'))) return false;
  }
  return true;
}

function walkDir(dir, files) {
  files = files || [];
  var entries = fs.readdirSync(dir);
  for (var i = 0; i < entries.length; i++) {
    var fullPath = path.join(dir, entries[i]);
    if (!shouldInclude(fullPath)) continue;
    var stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function apiRequest(method, urlPath, body) {
  return new Promise(function(resolve, reject) {
    var opts = {
      hostname: 'api.github.com',
      path: urlPath,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + TOKEN,
        'User-Agent': 'VocosAI-Deploy',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }
    var req = https.request(opts, function(res) {
      var d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, raw: d }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getDefaultBranchSha() {
  var ref = await apiRequest('GET', '/repos/' + OWNER + '/' + REPO + '/git/ref/heads/' + BRANCH);
  if (ref.status === 200 && ref.data.object) return ref.data.object.sha;
  
  // 尝试创建分支
  var masterRef = await apiRequest('GET', '/repos/' + OWNER + '/' + REPO + '/git/ref/heads/master');
  if (masterRef.status === 200 && masterRef.data.object) {
    await apiRequest('POST', '/repos/' + OWNER + '/' + REPO + '/git/refs', {
      ref: 'refs/heads/' + BRANCH,
      sha: masterRef.data.object.sha,
    });
    return masterRef.data.object.sha;
  }
  
  // 如果仓库为空，返回 null
  return null;
}

async function createBlob(content) {
  var res = await apiRequest('POST', '/repos/' + OWNER + '/' + REPO + '/git/blobs', {
    content: content,
    encoding: 'utf-8',
  });
  if (res.status === 201) return res.data.sha;
  throw new Error('Failed to create blob: ' + JSON.stringify(res));
}

async function pushFiles() {
  console.log('=== VocosAI GitHub Push ===\n');
  
  // 1. 收集所有文件
  console.log('1. Collecting files...');
  var allFiles = walkDir(PROJECT_DIR);
  console.log('   Found ' + allFiles.length + ' files to upload\n');
  
  // 2. 获取当前 HEAD SHA
  console.log('2. Getting current branch state...');
  var baseSha = await getDefaultBranchSha();
  if (baseSha) {
    var baseTreeRes = await apiRequest('GET', '/repos/' + OWNER + '/' + REPO + '/git/commits/' + baseSha);
    var baseTreeSha = baseTreeRes.data.tree.sha;
    console.log('   Base tree: ' + baseTreeSha.slice(0, 7));
  }
  
  // 3. 批量创建 blobs
  console.log('3. Creating blobs...');
  var treeEntries = [];
  var batchSize = 10;
  var total = allFiles.length;
  
  for (var i = 0; i < allFiles.length; i += batchSize) {
    var batch = allFiles.slice(i, i + batchSize);
    for (var j = 0; j < batch.length; j++) {
      var filePath = batch[j];
      var rel = path.relative(PROJECT_DIR, filePath).replace(/\\/g, '/');
      var content = fs.readFileSync(filePath, 'utf-8');
      var blobSha = await createBlob(content);
      treeEntries.push({
        path: rel,
        mode: '100644',
        type: 'blob',
        sha: blobSha,
      });
    }
    var pct = Math.round(((i + batch.length) / total) * 100);
    process.stdout.write('\r   Progress: ' + pct + '% (' + Math.min(i + batch.length, total) + '/' + total + ')');
  }
  console.log('\n   All blobs created');
  
  // 4. 创建 tree
  console.log('4. Creating tree...');
  var treeRes = await apiRequest('POST', '/repos/' + OWNER + '/' + REPO + '/git/trees', {
    base_tree: baseSha ? (await apiRequest('GET', '/repos/' + OWNER + '/' + REPO + '/git/commits/' + baseSha)).data.tree.sha : undefined,
    tree: treeEntries,
  });
  var treeSha = treeRes.data.sha;
  console.log('   Tree: ' + treeSha.slice(0, 7));
  
  // 5. 创建 commit
  console.log('5. Creating commit...');
  var commitRes = await apiRequest('POST', '/repos/' + OWNER + '/' + REPO + '/git/commits', {
    message: 'v2.0.0 - VocosAI deploy to meetmore.cc\n\n' +
      'Frontend: React 18 + TypeScript + Vite 5\n' +
      'Backend: Fastify 4 + Prisma 5 + SQLite\n' +
      'Features: 17 AI Agents + Skill System + E2E Tests',
    tree: treeSha,
    parents: baseSha ? [baseSha] : [],
  });
  var commitSha = commitRes.data.sha;
  console.log('   Commit: ' + commitSha.slice(0, 7));
  
  // 6. 更新 ref
  console.log('6. Updating branch...');
  await apiRequest('PATCH', '/repos/' + OWNER + '/' + REPO + '/git/refs/heads/' + BRANCH, {
    sha: commitSha,
    force: false,
  });
  
  console.log('\n=== Push complete! ===');
  console.log('Repository: https://github.com/' + OWNER + '/' + REPO);
  console.log('Commit: ' + commitSha.slice(0, 7));
}

pushFiles().catch(function(err) {
  console.error('Push failed:', err.message);
  process.exit(1);
});

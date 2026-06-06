var h = require('https');
var opts = { hostname: 'api.github.com', path: '/repos/Mikesure000/VocosAI', headers: { 'User-Agent': 'VocosAI', 'Accept': 'application/vnd.github.v3+json' } };
h.get(opts, function(r) { var d = ''; r.on('data', function(c) { d += c; }); r.on('end', function() { var j = JSON.parse(d); console.log('Repo:', j.full_name || 'NOT FOUND'); console.log('Branch:', j.default_branch); console.log('URL:', j.html_url); }); }).on('error', function(e) { console.log('Error:', e.message); });

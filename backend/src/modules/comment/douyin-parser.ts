/**
 * 抖音评论文件解析器
 * 基于竞品导出 Excel 标准格式，支持 21 个字段
 * 
 * 表头结构：
 * 评论ID | 评论内容 | 评论图片链接 | 点赞量 | 评论时间 | IP地址 | 子评论数 |
 * 视频ID | 视频链接 | 用户UID | 用户链接 | 用户名称 | 抖音号 |
 * 一级评论ID | 一级评论内容 | 一级评论用户UID | 一级评论用户名称 |
 * 引用的评论ID | 引用的评论内容 | 引用的用户UID | 引用的用户名称
 */

import * as XLSX from 'xlsx';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { detectSignals } from '../comment/comment-signals.js';

// 标准字段映射
export const DOUYIN_STANDARD_FIELDS = {
  comment_id: '评论ID',
  comment_text: '评论内容',
  comment_image: '评论图片链接',
  like_count: '点赞量',
  created_at: '评论时间',
  ip_location: 'IP地址',
  reply_count: '子评论数',
  video_id: '视频ID',
  video_url: '视频链接',
  user_uid: '用户UID',
  user_url: '用户链接',
  user_name: '用户名称',
  douyin_id: '抖音号',
  parent_comment_id: '一级评论ID',
  parent_comment_text: '一级评论内容',
  parent_user_uid: '一级评论用户UID',
  parent_user_name: '一级评论用户名称',
  quoted_comment_id: '引用的评论ID',
  quoted_comment_text: '引用的评论内容',
  quoted_user_uid: '引用的用户UID',
  quoted_user_name: '引用的用户名称',
} as const;

export interface ParsedComment {
  commentIdExternal: string;
  commentText: string;
  normalizedText: string;
  likeCount: number;
  createdAtExternal: string | null;
  ipLocation: string;
  replyCount: number;
  videoId: string;
  videoUrl: string;
  userIdHash: string;
  userNameHash: string;
  douyinId: string;
  parentCommentId: string | null;
  parentCommentText: string | null;
  parentUserName: string | null;
  quotedCommentId: string | null;
  quotedCommentText: string | null;
  quotedUserName: string | null;
  isReply: boolean;
  isQuoted: boolean;
  signals: string[];
  valueScore: number;
  cleanStatus: string;
}

export interface ParseResult {
  columns: string[];
  mappedColumns: Record<string, string>;
  comments: ParsedComment[];
  stats: {
    total: number;
    topLevel: number;
    replies: number;
    quoted: number;
    withSignals: number;
    highValue: number;
    duplicateIds: number;
  };
}

/**
 * 解析 Excel 文件（支持 .xlsx / .xls）
 */
export function parseExcelFile(filePath: string): ParseResult {
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const columns = Object.keys(rawData[0] || {});

  return processRawData(rawData, columns, path.basename(filePath));
}

/**
 * 解析 CSV 文件
 */
export function parseCsvFile(filePath: string): ParseResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim());

  if (lines.length === 0) {
    return { columns: [], mappedColumns: {}, comments: [], stats: { total: 0, topLevel: 0, replies: 0, quoted: 0, withSignals: 0, highValue: 0, duplicateIds: 0 } };
  }

  const headers = parseCSVLine(lines[0]);
  const rawData = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, any> = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });

  return processRawData(rawData, headers, path.basename(filePath));
}

/**
 * 自动映射表头到标准字段
 */
function autoMapColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const header of headers) {
    const trimmed = header.trim();

    // 精确匹配
    for (const [key, label] of Object.entries(DOUYIN_STANDARD_FIELDS)) {
      if (trimmed === label) {
        mapping[header] = key;
        break;
      }
    }

    // 如果没匹配到，尝试模糊匹配
    if (!mapping[header]) {
      if (trimmed.includes('评论ID') || trimmed.includes('评论id')) mapping[header] = 'comment_id';
      else if (trimmed.includes('评论内容') || trimmed.includes('评论正文')) mapping[header] = 'comment_text';
      else if (trimmed.includes('评论图片')) mapping[header] = 'comment_image';
      else if (trimmed.includes('点赞') || trimmed.includes('like')) mapping[header] = 'like_count';
      else if (trimmed.includes('评论时间') || trimmed.includes('时间') || trimmed.includes('created')) mapping[header] = 'created_at';
      else if (trimmed.includes('IP') || trimmed.includes('地址')) mapping[header] = 'ip_location';
      else if (trimmed.includes('子评论') || trimmed.includes('回复数')) mapping[header] = 'reply_count';
      else if (trimmed.includes('视频ID') || trimmed.includes('视频id')) mapping[header] = 'video_id';
      else if (trimmed.includes('视频链接') || trimmed.includes('视频url')) mapping[header] = 'video_url';
      else if (trimmed.includes('用户UID') || trimmed.includes('用户uid')) mapping[header] = 'user_uid';
      else if (trimmed.includes('用户链接')) mapping[header] = 'user_url';
      else if (trimmed.includes('用户名称') || trimmed.includes('用户名') || trimmed.includes('昵称')) mapping[header] = 'user_name';
      else if (trimmed.includes('抖音号')) mapping[header] = 'douyin_id';
      else if (trimmed.includes('一级评论ID')) mapping[header] = 'parent_comment_id';
      else if (trimmed.includes('一级评论内容')) mapping[header] = 'parent_comment_text';
      else if (trimmed.includes('一级评论用户UID')) mapping[header] = 'parent_user_uid';
      else if (trimmed.includes('一级评论用户名称')) mapping[header] = 'parent_user_name';
      else if (trimmed.includes('引用的评论ID')) mapping[header] = 'quoted_comment_id';
      else if (trimmed.includes('引用的评论内容')) mapping[header] = 'quoted_comment_text';
      else if (trimmed.includes('引用的用户UID')) mapping[header] = 'quoted_user_uid';
      else if (trimmed.includes('引用的用户名称')) mapping[header] = 'quoted_user_name';
      else mapping[header] = 'ignore';
    }
  }

  return mapping;
}

/**
 * 核心数据处理
 */
function processRawData(rawData: Record<string, any>[], columns: string[], fileName: string): ParseResult {
  const mapping = autoMapColumns(columns);
  const comments: ParsedComment[] = [];
  const seenIds = new Set<string>();
  let duplicates = 0;

  for (const row of rawData) {
    const commentText = String(row[getOriginalColumn(mapping, 'comment_text', columns)] || '').trim();
    if (!commentText) continue;

    const commentId = String(row[getOriginalColumn(mapping, 'comment_id', columns)] || '').trim();

    // 去重
    if (commentId && seenIds.has(commentId)) { duplicates++; continue; }
    if (commentId) seenIds.add(commentId);

    // 解析时间
    let createdAt: string | null = null;
    const timeRaw = row[getOriginalColumn(mapping, 'created_at', columns)];
    if (timeRaw) {
      const num = Number(timeRaw);
      if (!isNaN(num) && num > 40000) {
        // Excel 日期序列号转换
        const date = new Date((num - 25569) * 86400 * 1000);
        createdAt = date.toISOString();
      } else {
        const d = new Date(timeRaw);
        if (!isNaN(d.getTime())) createdAt = d.toISOString();
      }
    }

    const parentId = String(row[getOriginalColumn(mapping, 'parent_comment_id', columns)] || '').trim() || null;
    const quotedId = String(row[getOriginalColumn(mapping, 'quoted_comment_id', columns)] || '').trim() || null;
    const isReply = !!parentId;
    const isQuoted = !!quotedId;

    // 信号检测
    const signals = detectSignals(commentText);

    // 价值评分
    let valueScore = 1;
    if (signals.length >= 3) valueScore = 5;
    else if (signals.length === 2) valueScore = 4;
    else if (signals.length === 1) valueScore = 3;
    else if (commentText.length > 20) valueScore = 2;

    // 清洗状态
    let cleanStatus = 'valid';
    if (commentText.length <= 2 && !signals.length) cleanStatus = 'short_invalid';
    else if (/^[顶赞好哈嗯哦]+$/.test(commentText) && commentText.length <= 3) cleanStatus = 'spam';
    else if (/^(ddd+|666+)$/i.test(commentText)) cleanStatus = 'spam';

    comments.push({
      commentIdExternal: commentId,
      commentText,
      normalizedText: commentText.replace(/\s+/g, ' ').trim(),
      likeCount: Number(row[getOriginalColumn(mapping, 'like_count', columns)]) || 0,
      createdAtExternal: createdAt,
      ipLocation: String(row[getOriginalColumn(mapping, 'ip_location', columns)] || '').trim(),
      replyCount: Number(row[getOriginalColumn(mapping, 'reply_count', columns)]) || 0,
      videoId: String(row[getOriginalColumn(mapping, 'video_id', columns)] || '').trim(),
      videoUrl: String(row[getOriginalColumn(mapping, 'video_url', columns)] || '').trim(),
      userIdHash: hashUserId(String(row[getOriginalColumn(mapping, 'user_uid', columns)] || '').trim()),
      userNameHash: hashUserName(String(row[getOriginalColumn(mapping, 'user_name', columns)] || '').trim()),
      douyinId: String(row[getOriginalColumn(mapping, 'douyin_id', columns)] || '').trim(),
      parentCommentId: parentId,
      parentCommentText: String(row[getOriginalColumn(mapping, 'parent_comment_text', columns)] || '').trim() || null,
      parentUserName: String(row[getOriginalColumn(mapping, 'parent_user_name', columns)] || '').trim() || null,
      quotedCommentId: quotedId,
      quotedCommentText: String(row[getOriginalColumn(mapping, 'quoted_comment_text', columns)] || '').trim() || null,
      quotedUserName: String(row[getOriginalColumn(mapping, 'quoted_user_name', columns)] || '').trim() || null,
      isReply,
      isQuoted,
      signals,
      valueScore,
      cleanStatus,
    });
  }

  return {
    columns,
    mappedColumns: mapping,
    comments,
    stats: {
      total: comments.length,
      topLevel: comments.filter((c) => !c.isReply).length,
      replies: comments.filter((c) => c.isReply).length,
      quoted: comments.filter((c) => c.isQuoted).length,
      withSignals: comments.filter((c) => c.signals.length > 0).length,
      highValue: comments.filter((c) => c.valueScore >= 4).length,
      duplicateIds: duplicates,
    },
  };
}

function getOriginalColumn(mapping: Record<string, string>, fieldKey: string, columns: string[]): string {
  for (const [col, mapped] of Object.entries(mapping)) {
    if (mapped === fieldKey) return col;
  }
  return '';
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

function hashUserId(uid: string): string {
  if (!uid) return '';
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    const ch = uid.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return 'u_' + Math.abs(hash).toString(36);
}

function hashUserName(name: string): string {
  if (!name) return '';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return 'n_' + Math.abs(hash).toString(36);
}

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../.env');

if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

export const env = {
  HOST: process.env.HOST || '127.0.0.1',
  PORT: parseInt(process.env.PORT || '8787', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',

  VOCOS_MODEL_MODE: process.env.VOCOS_MODEL_MODE || 'mock',
  VOCOS_PRIMARY_PROVIDER: process.env.VOCOS_PRIMARY_PROVIDER || 'deepseek',

  DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash',
  DEEPSEEK_REASONING_MODEL: process.env.DEEPSEEK_REASONING_MODEL || 'deepseek-v4-pro',

  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4.1',
  OPENAI_MINI_MODEL: process.env.OPENAI_MINI_MODEL || 'gpt-4.1-mini',

  VOCOS_KEY_ENCRYPTION_SECRET: process.env.VOCOS_KEY_ENCRYPTION_SECRET || 'dev-encryption-secret',
  VOCOS_MONTHLY_QUOTA: parseInt(process.env.VOCOS_MONTHLY_QUOTA || '1000000', 10),
  VOCOS_TASK_COST_LIMIT: parseFloat(process.env.VOCOS_TASK_COST_LIMIT || '12.00'),
} as const;

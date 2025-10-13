import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Redis from 'ioredis';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import winston from 'winston';

dotenv.config();

const PORT = process.env.PORT || 10000;
const REDIS_URL = process.env.REDIS_URL || process.env.VALKEY_URL || process.env.REDIS;
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '86400', 10);
const RATE_WINDOW_MIN = parseInt(process.env.RATE_LIMIT_WINDOW_MIN || '15', 10);
const RATE_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);

if (!REDIS_URL) {
  console.error('ERROR: REDIS_URL not set in environment.');
  process.exit(1);
}

// === Logger (winston) ===
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [new winston.transports.Console()]
});

// === Redis (Valkey) connection ===
const redis = new Redis(REDIS_URL, {
  enableOfflineQueue: true,
  lazyConnect: false,
});

redis.on('connect', () => logger.info('Connected to Redis/Valkey'));
redis.on('error', (err) => logger.error('Redis error: ' + err.message));

// === Load prompts ===
const promptsPath = path.resolve('./config/prompts.json');
let prompts = {};
try {
  prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
} catch (err) {
  logger.warn('Could not load prompts.json: ' + err.message);
}

// === Express app ===
const app = express();
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: true,
  methods: ['GET','POST','OPTIONS'],
}));
app.use(express.json());

// === Rate limiter ===
const limiter = rateLimit({
  windowMs: RATE_WINDOW_MIN * 60 * 1000,
  max: RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// === Helpers ===
function normalizeNumber(num) {
  if (!num) return null;
  let s = String(num).trim();
  s = s.replace(/[^0-9+]/g, '');
  if (s.startsWith('0')) s = '+62' + s.slice(1);
  if (!s.startsWith('+')) s = '+' + s;
  return s;
}

function mockValidation(type, number) {
  const e164 = normalizeNumber(number);
  const confidence = Math.round(Math.random() * 80 + 20) / 100;
  const base = {
    input: number,
    e164,
    valid: true,
    type,
    country: 'ID',
    carrier: 'Telkomsel',
    confidence,
    reason: 'Simulated result - replace with real provider checks'
  };
  if (type === 'e-wallet') {
    base.possible_providers = ['Gopay','DANA'];
    base.registered = null;
  }
  if (type === 'activated') {
    base.active = true;
    base.method_used = 'simulated';
  }
  if (type === 'whatsapp') {
    base.is_whatsapp = true;
  }
  return base;
}

async function cacheGet(key) {
  try {
    const v = await redis.get(key);
    if (!v) return null;
    return JSON.parse(v);
  } catch (err) {
    logger.warn('cacheGet error: ' + err.message);
    return null;
  }
}
async function cacheSet(key, value, ex = CACHE_TTL) {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ex);
  } catch (err) {
    logger.warn('cacheSet error: ' + err.message);
  }
}

// === Routes ===
app.get('/api/ping', async (req, res) => {
  try {
    const pong = await redis.ping();
    res.json({ status: 'ok', redis: pong });
  } catch (err) {
    logger.error('ping error: ' + err.message);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.get('/api/prompts', (req, res) => {
  res.json(prompts);
});

app.post('/api/validate', async (req, res) => {
  const { number, numbers, skipCache } = req.body || {};
  if (!number && !Array.isArray(numbers)) {
    return res.status(400).json({ error: 'Provide "number" or "numbers" array in body.' });
  }

  if (number) {
    const key = `val:single:${number}`;
    if (!skipCache) {
      const cached = await cacheGet(key);
      if (cached) return res.json({ cached: true, ...cached });
    }
    const wa = mockValidation('whatsapp', number);
    const ew = mockValidation('e-wallet', number);
    const ac = mockValidation('activated', number);
    const result = { input: number, e164: wa.e164, whatsapp: wa, e_wallet: ew, activated: ac };
    await cacheSet(key, result);
    await redis.lpush('logs', JSON.stringify({ t: Date.now(), type: 'validate', number }));
    return res.json(result);
  }

  const nums = numbers;
  if (!Array.isArray(nums) || nums.length === 0) {
    return res.status(400).json({ error: '"numbers" must be a non-empty array.' });
  }
  const results = [];
  for (const n of nums) {
    const key = `val:single:${n}`;
    let r = null;
    if (!skipCache) r = await cacheGet(key);
    if (!r) {
      const wa = mockValidation('whatsapp', n);
      const ew = mockValidation('e-wallet', n);
      const ac = mockValidation('activated', n);
      r = { input: n, e164: wa.e164, whatsapp: wa, e_wallet: ew, activated: ac };
      await cacheSet(key, r);
    }
    results.push(r);
  }
  const summary = {
    total_checked: results.length,
    valid_counts: {
      whatsapp: results.filter(x => x.whatsapp && x.whatsapp.is_whatsapp).length,
      e_wallet: results.filter(x => x.e_wallet && x.e_wallet.registered !== false).length,
      activated: results.filter(x => x.activated && x.activated.active).length
    }
  };
  await redis.lpush('logs', JSON.stringify({ t: Date.now(), type: 'validate_batch', count: results.length }));
  res.json({ results, summary });
});

app.use((req,res)=>res.status(404).json({error:'not_found'}));

app.listen(PORT, ()=> logger.info(`Server listening on port ${PORT}`));

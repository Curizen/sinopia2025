const express = require('express');
const axios = require('axios');
const router = express.Router();

const ensureChatAllowed = (req, res, next) => next();

router.post('/', ensureChatAllowed, async (req, res) => {
  try {
    const raw = req.body?.message ?? req.body?.query ?? '';
    const query = String(raw).trim().slice(0, 12000000);
    if (!query) return res.status(400).json({ ok: false, error: 'Empty message' });

    let ip_address =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';
    if (ip_address === '::1' || ip_address === '::ffff:127.0.0.1') ip_address = '127.0.0.1';
    if (ip_address.startsWith('::ffff:')) ip_address = ip_address.replace('::ffff:', '');

    const client_id = req.cookies?.curizen_client_id || req.body?.client_id || 'unknown';

    const N8N_WEBHOOK = 'https://curizen.app.n8n.cloud/webhook/ask_from_client';
    const payload = { query, ip_address, client_id };

    const n8nRes = await axios.post(N8N_WEBHOOK, payload, { timeout: 20000000 });

    const extractReply = (data) => {
      if (data === null || data === undefined) return null;

      if (typeof data === 'string') return data;

      if (Array.isArray(data)) {
        for (const item of data) {
          if (typeof item === 'string') return item;
          if (typeof item === 'object') return item.reply ?? item.output ?? item.text ?? JSON.stringify(item);
        }
        return JSON.stringify(data);
      }

      if (typeof data === 'object') {
        if (data.skills || data.pricing) return JSON.stringify(data); 
        return data.reply ?? data.output ?? data.text ?? JSON.stringify(data);
      }

      return String(data);
    };

    const reply = extractReply(n8nRes.data) ?? 'No reply';

    console.log('Chat proxy ->', { query, ip_address, client_id, reply });

    return res.json({ ok: true, reply, client_id });
  } catch (err) {
    console.error('Chat proxy error:', err?.message ?? err);
    return res.status(500).json({ ok: false, error: 'Failed to send message to bot' });
  }
});

module.exports = router;

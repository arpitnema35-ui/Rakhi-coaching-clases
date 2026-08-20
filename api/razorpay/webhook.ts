// Vercel Serverless Function: Razorpay Webhook Handler
// Endpoint: /api/razorpay/webhook (and /api/webhook)

import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      status: 'active',
      service: 'Rakhi Coaching Classes Razorpay Webhook Listener',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body;

    // If webhook secret is configured in dashboard, verify signature
    if (webhookSecret && signature) {
      const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('Webhook signature mismatch');
        res.status(400).json({ status: 'signature_verification_failed' });
        return;
      }
    }

    const payload = typeof body === 'string' ? JSON.parse(body) : body;
    const event = payload?.event;
    console.log(`Received Razorpay webhook event: ${event}`);

    // Process event types: payment.captured, order.paid, payment.failed
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payload?.payment?.entity;
      console.log('Payment Captured Successfully:', {
        id: paymentEntity?.id,
        amount: paymentEntity?.amount,
        email: paymentEntity?.email,
        contact: paymentEntity?.contact
      });
    }

    res.status(200).json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error?.message || 'Internal Webhook Error' });
  }
}

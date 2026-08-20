// Vercel Serverless Function: Verify Razorpay Payment Signature
// Endpoint: /api/razorpay/verify

import crypto from 'crypto';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'IQ8mO0VsGTkvBqzsVC7d8FtJ';
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

    if (!razorpay_payment_id) {
      res.status(400).json({ success: false, error: 'Missing razorpay_payment_id' });
      return;
    }

    if (razorpay_order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      const isSignatureValid = generatedSignature === razorpay_signature;

      if (!isSignatureValid) {
        res.status(400).json({
          success: false,
          verified: false,
          error: 'Invalid Razorpay Signature'
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Verification Server Error'
    });
  }
}

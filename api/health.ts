// Vercel Serverless Function: Health Check
// Endpoint: /api/health

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    appName: 'Rakhi Coaching Classes',
    version: '1.0.0',
    gateway: 'Razorpay Live',
    keyId: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TRvY1heMKDgp8s',
    timestamp: new Date().toISOString()
  });
}

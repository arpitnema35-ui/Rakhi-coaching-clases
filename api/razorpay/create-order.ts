// Vercel Serverless Function: Create Razorpay Order
// Endpoint: /api/razorpay/create-order

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TRvY1heMKDgp8s';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'IQ8mO0VsGTkvBqzsVC7d8FtJ';

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const amountInRupees = Number(body?.amount) || 149;
    const amountInPaise = Math.round(amountInRupees * 100);

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const orderPayload = {
      amount: amountInPaise,
      currency: body?.currency || 'INR',
      receipt: body?.receipt || `rcpt_${Date.now()}`,
      notes: {
        institute: 'Rakhi Coaching Classes',
        website: 'https://rakhicoachingclasses.com',
        ...(body?.notes || {})
      }
    };

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay API error response:', data);
      res.status(response.status).json({
        success: false,
        error: data.error?.description || 'Failed to create Razorpay order',
        keyId
      });
      return;
    }

    res.status(200).json({
      success: true,
      order: data,
      keyId: keyId
    });
  } catch (error: any) {
    console.error('Server error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Internal Server Error'
    });
  }
}

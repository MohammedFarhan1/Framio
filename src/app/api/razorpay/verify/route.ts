import { NextRequest } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return Response.json({ verified: false, error: 'Missing parameters' }, { status: 400 });
    }

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    const verified = expectedSignature === razorpaySignature;

    if (!verified) {
      return Response.json({ verified: false, error: 'Invalid signature' }, { status: 400 });
    }

    return Response.json({ verified: true });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return Response.json({ verified: false, error: 'Verification failed' }, { status: 500 });
  }
}

import { NextRequest } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (!amount || typeof amount !== 'number' || amount < 1) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { source: 'framio.shop' },
    });

    return Response.json({
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return Response.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}

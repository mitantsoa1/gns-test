import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
        return new NextResponse('Missing stripe-signature header', { status: 400 });
    }

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error('⚠️  Webhook signature verification failed:', err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutSessionCompleted(session);
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentIntentSucceeded(paymentIntent);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                await handlePaymentIntentFailed(paymentIntent);
                break;
            }

            case 'charge.succeeded': {
                const charge = event.data.object as Stripe.Charge;
                await handleChargeSucceeded(charge);
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                await handleChargeRefunded(charge);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Error processing webhook:', error);
        return new NextResponse(`Webhook handler failed: ${error.message}`, { status: 500 });
    }
}

// Handle checkout session completed
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    console.log('✅ Checkout session completed:', session.id);

    const metadata = session.metadata || {};
    const userId = metadata.userId || null;
    const productId = metadata.productId || null;

    // Get line items to extract product information
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const firstItem = lineItems.data[0];

    const payment = await prisma.payment.create({
        data: {
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            amount: session.amount_total || 0,
            currency: session.currency || 'eur',
            status: session.payment_status === 'paid' ? 'succeeded' : 'pending',
            customerEmail: session.customer_details?.email || null,
            customerName: session.customer_details?.name || null,
            productId: productId,
            productName: firstItem?.description || 'Unknown Product',
            quantity: firstItem?.quantity || 1,
            userId: userId,
            metadata: metadata as any,
            paidAt: session.payment_status === 'paid' ? new Date() : null,
        },
    });

    console.log('💾 Payment record created:', payment.id);
}

// Handle payment intent succeeded
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('✅ Payment intent succeeded:', paymentIntent.id);

    // Update payment record if exists
    const existingPayment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (existingPayment) {
        await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
                status: 'succeeded',
                paidAt: new Date(),
                // receiptUrl: paymentIntent.charges.data[0]?.receipt_url || null,
            },
        });
        console.log('💾 Payment record updated:', existingPayment.id);
    } else {
        // Create new payment record if doesn't exist
        const metadata = paymentIntent.metadata || {};
        await prisma.payment.create({
            data: {
                stripePaymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: 'succeeded',
                paymentMethod: paymentIntent.payment_method_types[0] || null,
                customerEmail: metadata.customerEmail || null,
                customerName: metadata.customerName || null,
                productId: metadata.productId || null,
                productName: metadata.productName || 'Unknown Product',
                quantity: parseInt(metadata.quantity || '1'),
                userId: metadata.userId || null,
                metadata: metadata as any,
                paidAt: new Date(),
                // receiptUrl: paymentIntent.charges.data[0]?.receipt_url || null,
            },
        });
        console.log('💾 New payment record created for payment intent');
    }
}

// Handle payment intent failed
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log('❌ Payment intent failed:', paymentIntent.id);

    const existingPayment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (existingPayment) {
        await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
                status: 'failed',
                failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
            },
        });
        console.log('💾 Payment marked as failed:', existingPayment.id);
    } else {
        // Create failed payment record
        const metadata = paymentIntent.metadata || {};
        await prisma.payment.create({
            data: {
                stripePaymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: 'failed',
                paymentMethod: paymentIntent.payment_method_types[0] || null,
                customerEmail: metadata.customerEmail || null,
                customerName: metadata.customerName || null,
                productId: metadata.productId || null,
                productName: metadata.productName || 'Unknown Product',
                quantity: parseInt(metadata.quantity || '1'),
                userId: metadata.userId || null,
                metadata: metadata as any,
                failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
            },
        });
        console.log('💾 Failed payment record created');
    }
}

// Handle charge succeeded
async function handleChargeSucceeded(charge: Stripe.Charge) {
    console.log('✅ Charge succeeded:', charge.id);

    const existingPayment = await prisma.payment.findFirst({
        where: { stripePaymentIntentId: charge.payment_intent as string },
    });

    if (existingPayment) {
        await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
                stripeChargeId: charge.id,
                receiptUrl: charge.receipt_url || null,
                invoiceUrl: `https://invoice.stripe.com/i/charge.invoice`,
            },
        });
        console.log('💾 Payment updated with charge details:', existingPayment.id);
    }
}

// Handle charge refunded
async function handleChargeRefunded(charge: Stripe.Charge) {
    console.log('🔄 Charge refunded:', charge.id);

    const existingPayment = await prisma.payment.findFirst({
        where: { stripeChargeId: charge.id },
    });

    if (existingPayment) {
        await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
                status: 'refunded',
                refundedAt: new Date(),
            },
        });
        console.log('💾 Payment marked as refunded:', existingPayment.id);
    }
}

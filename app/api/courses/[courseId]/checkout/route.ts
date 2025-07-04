import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { ur } from "zod/v4/locales";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-06-30.basil",
    typescript: true,
});

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
    try {
        const user = await currentUser();
        if (!user || !user.id || !user.emailAddresses) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const course = await db.course.findUnique({
            where: {
                id: params.courseId,
                isPublished: true,
            }
        });

        const purachase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: params.courseId,
                }
            }
        });

        if (!purachase) {
            return new NextResponse('You already purchased this course', { status: 400 });
        }

        if (!course) {
            return new NextResponse('not found', { status: 404 });
        }

        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
            quantity: 1,
            price_data: {
                currency: 'USD',
                product_data: {
                    name: course.title,
                    description: course.description!,
                },
                unit_amount: Math.round(course.price! * 100), // Convert to cents
            }
        }];

        let stripeCustomer = await db.stripeCustomer.findUnique({
            where: {
                userId: user.id,
            },
            select: {
                stripeCustomerId: true,
            }
        });

        if (!stripeCustomer) {
            const customer = await stripe.customers.create({
                email: user.emailAddresses[0]?.emailAddress,

            });

            stripeCustomer = await db.stripeCustomer.create({
                data: {
                    userId: user.id,
                    stripeCustomerId: customer.id,
                }
            });
        }

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomer.stripeCustomerId,
            line_items: line_items,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_URL}/courses/${course.id}?/success=1`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/courses/${course.id}?/cancel=1`,
            metadata: {
                courseId: course.id,
                userId: user.id,
            }
        });

        return NextResponse.json({ ur: session.url });


    } catch (err) {
        console.error('Error in checkout route:', err);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
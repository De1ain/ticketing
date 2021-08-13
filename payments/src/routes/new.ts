import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
    requireAuth,
    validateRequest,
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    OrderStatus,
} from '@ticketing-microservices-common/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments',
    requireAuth,
    [
        body('token').not().isEmpty().withMessage('token must be provided'),
        body('orderId').not().isEmpty().withMessage('orderId must be provided'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }
        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Cannot pay for an cancelled order');
        }

        const charge = await stripe.charges.create({
            currency: 'usd',
            amount: convertPriceToCents(order.price),
            source: token,
            description: 'Ticketing shop with microservices',
        });

        // storing payments to payments DB
        const payment = Payment.build({
            orderId,
            stripeId: charge.id,
        });
        await payment.save();

        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
        });

        res.status(201).send({ id: payment.id });
    }
);

const convertPriceToCents = (price: number) => {
    return price * 100;
}

export { router as createChargeRouter };

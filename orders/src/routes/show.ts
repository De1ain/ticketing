import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
    requireAuth,
    validateRequest,
    NotFoundError,
    NotAuthorizedError
} from '@ticketing-microservices-common/common';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:orderId',
    requireAuth,
    validateRequest,
    async (req: Request, res: Response) => {
        // if (typeof req.params.orderId !== mongoose.Types.ObjectId) {
        //     throw new RequestValidationError();
        // }

        const order = await Order.findById(req.params.orderId).populate('ticket');
        
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        res.send(order);
    }
);

export { router as showOrderRouter };
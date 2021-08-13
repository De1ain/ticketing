import request from "supertest";
import mongoose from 'mongoose';
import { OrderStatus } from '@ticketing-microservices-common/common';
import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// jest.mock('../../stripe'); // using stripe from __mocks__ dir

it('returns a 404 when purchasing an order that does not exist', async () => {
    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup())
        .send({
            token: 'asdasd',
            orderId: mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 10,
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0
    });
    await order.save();

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup())
        .send({
            token: 'asdasd',
            orderId: order.id,
        })
        .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 10,
        status: OrderStatus.Cancelled,
        userId: userId,
        version: 0
    });
    await order.save();

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup(userId))
        .send({
            token: 'asdasd',
            orderId: order.id,
        })
        .expect(400);
});

// it('returns a 201 with valid inputs', async () => {
//     const userId = mongoose.Types.ObjectId().toHexString();
//     const order = Order.build({
//         id: mongoose.Types.ObjectId().toHexString(),
//         price: 10,
//         status: OrderStatus.Created,
//         userId: userId,
//         version: 0
//     });
//     await order.save();
//     await request(app)
//         .post('/api/payments')
//         .set('Cookie', global.signup(userId))
//         .send({
//             token: 'tok_visa', // token that always works for accounts that are in test mode
//             orderId: order.id
//         })
//         .expect(201);
//     const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]; // [0][0] = first call, first argument
//     expect(chargeOptions.source).toEqual('tok_visa');
//     expect(chargeOptions.currency).toEqual('usd');
//     expect(chargeOptions.amount).toEqual(10*100);
// });

/* Another way to test the stripe API is to create a ticket with some random price, then use Stripe API method to list all charges, and find the order with that price. 
In this approach there's no need in stripe mock file.
Example: 
    const price = Math.floor(Math.random() * 100000);
    const stripeCharges = await stripe.charges.list({limit: 50});
    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === price * 100
    });
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');
*/
it('returns a 201 with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price,
        status: OrderStatus.Created,
        userId: userId,
        version: 0
    });
    await order.save();

    const { body } = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup(userId))
        .send({
            token: 'tok_visa', // token that always works for accounts that are in test mode
            orderId: order.id
        })
        .expect(201);
    
    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === price * 100
    });
    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');
        
    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    });
    expect(payment).not.toBeNull();
    expect(body.id).toEqual(payment!.id);
});
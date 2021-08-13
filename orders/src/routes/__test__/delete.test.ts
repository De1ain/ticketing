import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from './../../nats-wrapper';

// User must be the owner of the order to modify it

it('should throw 404 when trying to cancel an order that does not exist', async() => {
    const orderId = mongoose.Types.ObjectId();
    await request(app)
        .delete(`/api/orders/${orderId}`)
        .set('Cookie', global.signup())
        .send()
        .expect(404);
});

it('should throw 401 if user is not authenticated', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Ticket',
        price: 70
    });
    await ticket.save();

    const user = global.signup();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);
    
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .send()
        .expect(401);
});

it('throws 401 if user is not the owner of the order', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Ticket',
        price: 70
    });
    await ticket.save();

    const userOne = global.signup();
    const userTwo = global.signup();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket.id })
        .expect(201);
    
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', userTwo)
        .send()
        .expect(401);
});

it('marks an order as canceled', async() => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Ticket',
        price: 70
    });
    await ticket.save();

    const user = global.signup();
    const responseCreate = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);
    
    await request(app)
        .delete(`/api/orders/${responseCreate.body.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    const canceledOrder = await Order.findById(responseCreate.body.id);
    expect(canceledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order-canceled-event', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Ticket',
        price: 70
    });
    await ticket.save();

    const user = global.signup();
    const responseCreate = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);
    
    await request(app)
        .delete(`/api/orders/${responseCreate.body.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
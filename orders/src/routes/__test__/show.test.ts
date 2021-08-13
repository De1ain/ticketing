import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('can only be accesse if the user is signed in', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Title',
        price: 11
    });
    await ticket.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .send({})
        .expect(401);
});

it('returns 404 is the order is not found', async () => {
    const fakeOrderId = mongoose.Types.ObjectId();
    const resposne = await request(app)
        .get(`/api/orders/${fakeOrderId}`)
        .set('Cookie', global.signup())
        .send()
        .expect(404);
});

it('should fail if user tries to fetch order that were created by other user', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Ticket title',
        price: 50
    });
    await ticket.save();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({ ticketId: ticket.id })
        .expect(201);
     
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signup())
        .send()
        .expect(401);
});

it('fetches the order', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Ticket title',
        price: 10
    });
    await ticket.save();

    const user = global.signup();
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);
    
    const { body: fetchOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);
    
    expect(fetchOrder.id).toEqual(order.id);
});

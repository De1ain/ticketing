import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';

import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 of the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signup())
        .send({
            title: 'updated title',
            price: 256
        })
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'updated title',
            price: 256
        })
        .expect(401);
});

it('returns a 401 if the user does not own a ticket', async () => {
    const title = 'Title1';
    const price = 20;
    const titleModified = 'Some modified title';
    const priceModified = 1000;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({
            title,
            price
        });
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signup())
        .send({
            title: titleModified,
            price: priceModified
        })
        .expect(401);
    
    const modifiedTicketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signup())
        .expect(200);
    
    // expect(modifiedTicketResponse.body.title).toEqual(titleModified);
    // expect(modifiedTicketResponse.body.price).toEqual(priceModified);
});

it('returns 400 if the user provides invalid title or price', async () => {
    const title = 'Title';
    const price = 30;
    const cookie = global.signup();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title, price
        })
        .expect(201);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: ''
        })
        .expect(400);
    
        await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 20
        })
        .expect(400);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            price: -5
        })
        .expect(400);
    
        await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
            .send({
            title: 'Title',
            price: -5
        })
        .expect(400);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: -5
        })
        .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
    const cookie = global.signup();
    const title = 'Title';
    const price = 30;
    const titleUpdated = 'Title updated';
    const priceUpdated = 700;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title, price
        })
        .expect(201);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: titleUpdated,
            price: priceUpdated
        })
        .expect(200);
    
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200)
    
    expect(ticketResponse.body.title).toEqual(titleUpdated);
    expect(ticketResponse.body.price).toEqual(priceUpdated);
});


it('publishes an event', async () => {
    const cookie = global.signup();
    const title = 'Title';
    const price = 30;
    const titleUpdated = 'Title updated';
    const priceUpdated = 700;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title, price
        })
        .expect(201);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: titleUpdated,
            price: priceUpdated
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates on a reserved ticket', async () => {
    const cookie = global.signup();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'Ticket title',
            price: 50,
        })
        .expect(201);
    
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Ticket title 2',
            price: 77,
        })
        .expect(400);
});
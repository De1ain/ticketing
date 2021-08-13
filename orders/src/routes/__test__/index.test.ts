import mongoose from 'mongoose';
import request from "supertest";
import { app } from "../../app";
import { Ticket } from '../../models/ticket';

const createTicket = async () => {
    const ticket = await Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Ticket title',
        price: 30
    });
    
    await ticket.save();
    
    return ticket;
}

it('fetches orders for a particular user', async () => {
    const ticketOne = await createTicket();
    const ticketTwo = await createTicket();
    const ticketThree = await createTicket();

    // Create 1 order as User #1
    const userOne = global.signup();
    const responseOne = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticketOne.id })
        .expect(201);

    // Create 2 orders as User #2
    const userTwo = global.signup();
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketTwo.id })
        .expect(201);
    
    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketThree.id })
        .expect(201);

    // Make request to get orders for user #2
    const responseIndex = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);
        
    // Make sure we only get orders for user #2
    expect(responseIndex.body.length).toBe(2);
    expect(responseIndex.body[0].id).toEqual(orderOne.id);
    expect(responseIndex.body[1].id).toEqual(orderTwo.id);
    expect(responseIndex.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(responseIndex.body[1].ticket.id).toEqual(ticketThree.id);
});
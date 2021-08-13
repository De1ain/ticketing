import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@ticketing-microservices-common/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Title 1',
        price: 10
    });
    await ticket.save();
    
    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        price: 22,
        title: 'Ticket title',
        userId: mongoose.Types.ObjectId().toHexString()
    };
    
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };
    
    return { listener, ticket, data, msg };
};

it('finds, updates and saves the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();
    
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.version).toBe(data.version);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toBe(data.price);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
    const { listener, ticket, data, msg } = await setup();

    data.version = 10;
    
    try {
        await listener.onMessage(data, msg);
    } catch (err) { }
    
    expect(msg.ack).not.toHaveBeenCalled();
});
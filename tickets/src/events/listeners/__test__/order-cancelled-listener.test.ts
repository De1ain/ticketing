import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from '@ticketing-microservices-common/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        price: 70,
        title: 'Concert ticket title',
        userId: mongoose.Types.ObjectId().toHexString(),
    });
    ticket.set({ orderId: orderId });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket.id,
            price: 60
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    
    return { listener, ticket, data, msg, orderId };
};

it('updates the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toBeUndefined();
});

it('acks the message', async () => {
    const { listener, ticket, data, msg, orderId } = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
});

it('publishes an event', async () => {
    const { listener, ticket, data, msg, orderId } = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

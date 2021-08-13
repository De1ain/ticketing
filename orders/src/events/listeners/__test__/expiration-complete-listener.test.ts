import mongoose from 'mongoose';
import { ExpirationCompleteEvent, OrderStatus } from '@ticketing-microservices-common/common';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        price: 30,
        title: 'Ticket title'
    });
    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'asdasd',
        expiresAt: new Date(),
        ticket
    });
    await order.save();

    const data: ExpirationCompleteEvent['data'] = { orderId: order.id };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, order, data, msg };
};

it('when order expires its status becomes cancelled', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('when order expires an appropriate event is emitted', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);
});

// it('when order expires ticket gets unreserved', async () => {
//     const { listener, ticket, data, msg } = await setup();

//     let isTicketReserved = await ticket.isReserved();
//     expect(isTicketReserved).toEqual(true);

//     await listener.onMessage(data, msg);

//     isTicketReserved = await ticket.isReserved();
//     expect(isTicketReserved).toEqual(false);
// });


// it('when order expires ticket gets unreserved ', async () => {
//     const { listener, ticket, data, msg } = await setup();

//     let isTicketReserved = await ticket.isReserved();
//     expect(isTicketReserved).toEqual(true);

//     await listener.onMessage(data, msg);

//     isTicketReserved = await ticket.isReserved();
//     expect(isTicketReserved).toEqual(false);
// });

it('ack the msg', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
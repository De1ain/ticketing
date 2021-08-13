import nats from 'node-nats-streaming';

import { TicketCreatedPublished } from './events/ticket-created-published';

console.clear();

const stanClient = nats.connect('ticketing', 'abc', {
    url: 'http://localhost:4222'
});

stanClient.on('connect', async () => {
    console.log('Publisher connected to NATS');

    // stanClient.on('close', () => {
    //     console.log('NATS connection closed');
    //     process.exit();
    // });

    const publisher = new TicketCreatedPublished(stanClient);
    try {
        await publisher.publish({
            id: '123',
            title: 'concert',
            price: 20
        });
    } catch (err) {
        console.error(err);
    }
    
    // const dataMsg = JSON.stringify({
    //     id: '123',
    //     title: 'Concert',
    //     price: 20
    // });

    // stanClient.publish('ticket:created', dataMsg, () => {
    //     console.log('Event published!');
    // });
});

// process.on('SIGINT', () => stanClient.close());
// process.on('SIGTERM', () => stanClient.close());
// // process.on('SIGUSR2', () => stanClient.close());
// // process.on('SIGQUIT', () => stanClient.close());
import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { on } from 'process';

import { TicketCreatedListener } from './events/ticket-created-listener';

console.clear();

const stanClient = nats.connect('ticketing', randomBytes(4).toString('hex'), {
    url: 'http://localhost:4222'
});

stanClient.on('connect', () => {
    console.log('Listener connected to NATS');

    stanClient.on('close', () => {
        console.log('NATS connection closed');
        process.exit();
    });
    new TicketCreatedListener(stanClient).listen();
});

process.on('SIGINT', () => stanClient.close());
process.on('SIGTERM', () => stanClient.close());
// process.on('SIGUSR2', () => stanClient.close());
// process.on('SIGQUIT', () => stanClient.close());

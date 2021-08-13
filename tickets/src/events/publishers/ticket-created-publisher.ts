import { Publisher, Subjects, TicketCreatedEvent } from '@ticketing-microservices-common/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    readonly subject = Subjects.TicketCreated;
}

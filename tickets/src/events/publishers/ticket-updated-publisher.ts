import { Publisher, Subjects, TicketUpdatedEvent } from '@ticketing-microservices-common/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    readonly subject = Subjects.TicketUpdated;
}

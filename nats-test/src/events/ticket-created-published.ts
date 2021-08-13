import { Publisher } from './base-publisher';
import { TicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';

export class TicketCreatedPublished extends Publisher<TicketCreatedEvent>{
    readonly subject = Subjects.TicketCreated;
}
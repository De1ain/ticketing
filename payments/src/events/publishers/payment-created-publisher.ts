import { Subjects, Publisher, PaymentCreatedEvent } from '@ticketing-microservices-common/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
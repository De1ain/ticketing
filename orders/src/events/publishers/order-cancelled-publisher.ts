import { Publisher, OrderCancelledEvent, Subjects } from '@ticketing-microservices-common/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    readonly subject = Subjects.OrderCancelled;
}
import {Subjects, Publisher, ExpirationCompleteEvent } from '@ticketing-microservices-common/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    readonly subject = Subjects.ExpirationComplete;
    
}
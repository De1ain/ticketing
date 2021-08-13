import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// An interface that describes the properties that are required to create a new Ticket
interface TicketAttrs{
    id: string;
    title: string;
    price: number;
}

// An interface that describes the properties that a Ticket Model has
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

// An interface that describes the properties that an Ticket Document has
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

// in case we donot want to use mongoose-update-if-current - another change is in orders - ticket-updated-listener.ts
// ticketSchema.pre('save', function (done) {
//     // @ts-ignore
//     this.$where = {
//         version: this.get('version') - 1
//     };
//     done();
// });

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
};

ticketSchema.statics.findByEvent = (event: {id: string, version: number}) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version -1
    })
};

/**
 * Run query to look at all orders. 
 * Find an order where the ticket is the ticket we just fetched and the order's status is not canceled. 
 * If we find an order from that means the ticket is reserved 
*/
ticketSchema.methods.isReserved = async function() {
    const existingOrder = await Order.findOne({
        // ticket: this.id,
        ticket: this as any,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });

    return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export {
    Ticket,
    TicketDoc
 };
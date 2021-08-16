import { OrderStatus } from '@ticketing-microservices-common/common';
import Link from 'next/link';

import buildClient from '../../api/build-client';
import BaseLayout from '../../components/base-layout';

const OrderIndex = ({ currentUser, orders }) => {
    const ordersList = orders.map((order) => {
        let orderTicketTitle;
        if (order.status !== OrderStatus.Complete && order.status !== OrderStatus.Cancelled) {
            orderTicketTitle =
                <Link href={`/orders/${order.id}`}>
                    <a className="link">{order.ticket.title}</a>
                </Link>
        } else {
            orderTicketTitle = order.ticket.title;
        }
        return (
            <tr key={order.id}>
                <td>{orderTicketTitle}</td>
                <td>{order.status}</td>
            </tr>
        );
    });

    return (
        <BaseLayout currentUser={currentUser && currentUser.currentUser}>
            <h1>My Orders</h1>
            <ul>
                {orders.length > 0
                    ?
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order Ticket Title</th>
                                <th>status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordersList}
                        </tbody>
                    </table>
                    :
                    <div>You have no orders yet</div>
                }
            </ul>
        </BaseLayout>
    );
};

const getServerSideProps = async (context) => {
    const client = buildClient(context);
    let currentUser = null;
    let orders = null;

    const resCurrentUser = await client.get('/api/users/currentuser');
    currentUser = resCurrentUser.data;
    const resOrders = await client.get('/api/orders');
    orders = resOrders.data;

    if (!currentUser) {
        currentUser = null;
    }
    if (!orders) {
        orders = null;
    }

    return { props: { currentUser, orders } };
};

export {
    OrderIndex as default,
    getServerSideProps
}
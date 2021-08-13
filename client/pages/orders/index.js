import buildClient from '../../api/build-client';
import BaseLayout from '../../components/base-layout';

const OrderIndex = ({ currentUser, orders }) => {
    return (
        <BaseLayout currentUser={currentUser && currentUser.currentUser}>
            <div>Order Index</div>
            <ul>
                {orders.map((order) => {
                    return (
                        <li key={order.id}>
                            {order.ticket.title} - {order.status}
                        </li>
                    );
                })}
            </ul>
        </BaseLayout>
    );
};

const getServerSideProps = async (context) => {
    const client = buildClient(context);
    const { data: currentUser } = await client.get('/api/users/currentUser');
    const { data: orders } = await client.get('/api/orders');

    return { props: { currentUser, orders } };
}

export {
    OrderIndex as default,
    getServerSideProps
}
import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import Router from 'next/router';

import buildClient from '../../api/build-client';
import BaseLayout from '../../components/base-layout';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ currentUser, order }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        data: { orderId: order.id },
        onSuccess: () => {
            Router.push('/orders')
        }
    })

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLeft / 1000));
        };

        findTimeLeft();
        const timerId = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(findTimeLeft);
        };
    }, []);

    return (
        <BaseLayout currentUser={currentUser && currentUser.currentUser}>
            <h1>Order Details</h1>
            {timeLeft < 0 ?
                <div>Order expired!</div>
                :
                <div>
                    Time left to pay: {timeLeft} seconds
                    <StripeCheckout
                        token={({ id }) => { doRequest({ token: id }) }}
                        stripeKey="pk_test_51J9u22FdSNhZtKCN8CMwq6k9pCXzvsA5YjGNYALOpk90iNOLDOuO9SiHbnbJ2e8t5yohfBHgw1Ykyjbc15VQAEPu004cLQsDKn"
                        amount={order.ticket.price * 100}
                        email={currentUser.currentUser.email}
                    />
                    {errors}
                </div>
            }
        </BaseLayout>
    );
};

const getServerSideProps = async (context) => {
    const client = buildClient(context);
    const { data: currentUser } = await client.get('/api/users/currentuser');
    const { orderId } = context.query;
    const { data } = await client.get(`/api/orders/${orderId}`);

    return { props: { currentUser, order: data } };
}

export {
    OrderShow as default,
    getServerSideProps
}
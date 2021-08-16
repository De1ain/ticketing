import Router from 'next/router';

import BaseLayout from "../../components/base-layout";
import buildClient from '../../api/build-client';
import useRequest from '../../hooks/use-request';

const TicketShow = ({ currentUser, ticket }) => {
    const { doRequest, errors } = useRequest({
        url: '/api/orders',
        method: 'post',
        data: { ticketId: ticket.id },
        onSuccess: (order) => Router.push(`/orders/${order.id}`)
    });

    return (
        <BaseLayout currentUser={currentUser && currentUser.currentUser}>
            <h1>Ticket Details</h1>
            <h3>{ticket.title}</h3>
            <h4>Price: {ticket.price}</h4>
            {errors}
            <button
                onClick={() => doRequest()}
                className="btn btn-primary"
            >
                Purchase
            </button>
        </BaseLayout>
    );
};

const getServerSideProps = async (context) => {
    const client = buildClient(context);
    const { data: currentUser } = await client.get('/api/users/currentuser');
    const { ticketId } = context.query;
    const { data } = await client.get(`/api/tickets/${ticketId}`);
    return { props: { currentUser, ticket: data } };
}

export {
    TicketShow as default,
    getServerSideProps
};
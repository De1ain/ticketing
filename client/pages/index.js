import Link from 'next/link';

import buildClient from '../api/build-client';
import BaseLayout from '../components/base-layout';

const LandingPage = ({ currentUser, tickets }) => {
    const ticketList = tickets.map((ticket) => {
        return (
            <tr key={ticket.id}>
                <td>
                    <Link href={`/tickets/${ticket.id}`}>
                        <a className="link">{ticket.title}</a>
                    </Link>
                </td>
                <td>{ticket.price}</td>
            </tr>
        );
    });

    return (
        <BaseLayout currentUser={currentUser && currentUser.currentUser}>
            <h1>Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </BaseLayout>
    );
};

// NextJS calls this function while it is attempting to render application on the server
// getServerSideProps() runs only on server
const getServerSideProps = async (context) => {
    const client = buildClient(context);
    let currentUser = null;
    let tickets = null;

    const resCurrentUser = await client.get('/api/users/currentuser');
    currentUser = resCurrentUser.data;
    const resTickets = await client.get('/api/tickets');
    tickets = resTickets.data;

    if (!currentUser) {
        currentUser = null;
    }
    if (!tickets) {
        tickets = null;
    }

    return { props: { currentUser, tickets } };
};

export {
    LandingPage as default,
    getServerSideProps
};
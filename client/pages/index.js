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
                <td>
                    <Link href={`/tickets/${ticket.id}`}>
                        <a className="link">View</a>
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <BaseLayout currentUser={currentUser && currentUser.currentUser}>
            Your are {!currentUser && ' NOT'} signed in
            <h2>Tickets</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
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
    const { data: currentUser } = await client.get('/api/users/currentuser');
    const { data: tickets } = await client.get('/api/tickets');

    return { props: { currentUser, tickets } };
}

export {
    LandingPage as default,
    getServerSideProps
};
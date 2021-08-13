import { useState } from 'react';
import Router from 'next/router';

import buildClient from '../../api/build-client';
import useRequest from '../../hooks/use-request';
import BaseLayout from '../../components/base-layout';

const NewTicket = ({ currentUser }) => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        data: { title, price },
        onSuccess: (ticket) => {
            Router.push('/');
        }
    });
    const [submitBtnState, setSubmitBtnState] = useState(false);

    const onSubmit = async event => {
        setSubmitBtnState(true);
        event.preventDefault();
        await doRequest();
    }

    const onBlur = () => {
        const value = parseFloat(price);
        if (isNaN(value)) {
            return;
        }
        setPrice(value.toFixed(2));
    }

    return (
        <BaseLayout currentUser={currentUser && currentUser.currentUser}>
            <h1>Create a Ticket</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        type="text"
                        className="form-control" />
                </div>
                <div className="form-group">
                    <label>Price</label>
                    <input
                        value={price}
                        onBlur={onBlur} // when the elem is defocused (deselected)
                        onChange={(e) => setPrice(e.target.value)}
                        type="text"
                        className="form-control" />
                </div>
                {errors}
                <button
                    className="btn btn-primary"
                    disabled={submitBtnState}
                >
                    Submit
                </button>
            </form>
        </BaseLayout>
    );
};

const getServerSideProps = async (context) => {
    const client = buildClient(context);
    let currentUser;
    try {
        const currentUserRes = await client.get("/api/users/currentuser");
        currentUser = currentUserRes.data;
    } catch (e) {
        console.log("error in new ticket page", e);
    }
    if (!currentUser) {
        currentUser = null;
    }
    return { props: { currentUser } };
};

export {
    NewTicket as default,
    getServerSideProps
};
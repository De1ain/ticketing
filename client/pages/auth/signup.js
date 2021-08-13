import { useState } from 'react';
import Router from 'next/router';

import buildClient from '../../api/build-client';
import useRequest from '../../hooks/use-request';
import BaseLayout from '../../components/base-layout';

const SignupComponent = ({ currentUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/users/signup',
        method: 'post',
        data: { email, password },
        onSuccess: () => Router.push('/')
    });

    const onSubmit = async event => {
        event.preventDefault();
        await doRequest();
    };

    return (
        <BaseLayout currentUser={currentUser && currentUser.currentUser}>
            <form onSubmit={onSubmit}>
                <h1>Sign Up</h1>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="form-control"
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                        className="form-control"
                    />
                </div>
                {errors}
                <button className="btn btn-primary">Sign Up</button>
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
        console.log("error in sigup page", e);
    }
    if (!currentUser) {
        currentUser = null;
    }
    return { props: { currentUser } };
};

export {
    SignupComponent as default,
    getServerSideProps
};
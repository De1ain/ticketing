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
                    <label htmlFor="emailInput">Email Address</label>
                    <input
                        id="emailInput"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="form-control"
                        placeholder="Enter email"
                    />
                    <small id="emailHelp" className="form-text text-muted">
                        We'll never share your email with anyone else.
                    </small>
                </div>
                <div className="form-group">
                    <label htmlFor="passwordInput">Password</label>
                    <input
                        id="passwordInput"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                        className="form-control"
                        placeholder="Password"
                    />
                </div>
                {errors}
                <button type="submit" className="btn btn-primary">Sign Up</button>
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
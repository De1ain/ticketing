import { useEffect } from 'react';
import Router from 'next/router';

import useRequest from '../../hooks/use-request';
import BaseLayout from '../../components/base-layout';

const SignoutComponent = () => {
    const { doRequest } = useRequest({
        url: '/api/users/signout',
        method: 'post',
        body: {},
        onSuccess: () => Router.push('/')
    });

    useEffect(() => {
        doRequest();
    }, []);

    return (
        <div>Signing you out...</div>
    );
};

export { SignoutComponent as default };


import request from 'supertest';
import { app } from '../../app';

it('clears cookie on signout a signed-in user', async () => {
    const responseSignup = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'asd@asd.com',
            password: '12345678'
        })
        .expect(201);
    
    const reponseSignout = await request(app)
        .post('/api/users/signout')
        .send({})
        .expect(200);
    
    expect(reponseSignout.get('Set-Cookie')).toBeDefined();
    
    expect(reponseSignout.get('Set-Cookie')[0]).toEqual('express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly');
    
    expect(reponseSignout.get('Set-Cookie')[0]).not.toEqual(responseSignup.get('Set-Cookie')[0]);
})
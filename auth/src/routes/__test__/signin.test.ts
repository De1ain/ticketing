import request from 'supertest';
import { app } from '../../app';

it('returns 400 with an invalid email', () => {
    return request(app)
        .post('/api/users/signin')
        .send({
            email: 'asd@asdcom',
            password: '12345678'
        })
        .expect(400);
});

it('returns 400 when no password provided', () => {
    return request(app)
        .post('/api/users/signin')
        .send({
            email: 'asd@asd.com'
        })
        .expect(400);
});

it('returns 400 when an email that doesn\'t exist is supplied', () => {
    return request(app)
        .post('/api/users/signin')
        .send({
            email: 'asd@asd.com',
            password: '12345678'
        })
        .expect(400);
});

it('returns 400 when an incorrect password is supplied for registered email', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'asd@asd.com',
            password: '12345678'
        })
        .expect(201);
    
    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'asd@asd.com',
            password: '1'
        })
        .expect(400);
});

it('returns 200 when correct credentials are supplied for registered email', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'asd@asd.com',
            password: '12345678'
        })
        .expect(201);
    
    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'asd@asd.com',
            password: '12345678'
        })
        .expect(200);
    
    expect(response.get('Set-Cookie')).toBeDefined();
});
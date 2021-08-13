import request from 'supertest';
import { app } from '../../app';

it('returns 201 on successfull signup', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'asd@asd.com',
            password: '12345678'
        })
        .expect(201);
});

it('returns a 400 with an invalid email', () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'invalidEmail',
            password: '12345678'
        })
        .expect(400);
});

it('returns a 400 with an invalid password', () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'asd@asd.com',
            password: '1'
        })
        .expect(400);
});

it('returns a 400 with missing email and password', () => {
    return request(app)
        .post('/api/users/signup')
        .send({})
        .expect(400);
});

it('returns a 400 with missing email and password', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'asd@asd.com',
        })
        .expect(400);
    
    await request(app)
        .post('/api/users/signup')
        .send({
            password: '12345678'
        })
        .expect(400);
});

it('disallows duplicate emails', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'asd@asd.com',
            password: '12345678'
        })
        .expect(201);
    
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'asd@asd.com',
            password: '12345678'
        })
        .expect(400);
});

it('sets a cookie after successful signup', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'asd@asd.com',
            password: '12345678'
        })
        .expect(201);
    
    expect(response.get('Set-Cookie')).toBeDefined();
})
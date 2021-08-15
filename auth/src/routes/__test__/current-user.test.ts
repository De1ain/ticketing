import request from 'supertest';
import { app } from '../../app';

it('responds with details about the current user', async () => {
    const cookie = await global.signup();
    
    // Supertest doesn't send cookies here
    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .send()
        .expect(400);
    // Supertest doesn't send cookies here
    
    expect(response.body.currentUser.email).toEqual('asd@asd.com');
});

it('responds with null if not authenticated', async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .send()
        .expect(200);
    
    expect(response.body.currentUser).toBeNull();
});

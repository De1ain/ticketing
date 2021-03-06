import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../app';

declare global {
    // namespace NodeJS {
        // interface Global {
             function signup(): Promise<string[]>;
        // }
    // }
}

require('dotenv').config();

let mongo: any;

beforeAll(async () => {
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signup = async () => {
    const email = 'asd@asd.com';
    const password = '12345678';

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password
        })
        .expect(201)
    
    const cookie = response.get('Set-Cookie');

    return cookie;
};
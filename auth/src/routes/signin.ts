import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@ticketing-microservices-common/common';

import { PasswordManager } from '../services/password-manager';
import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            throw new BadRequestError('Invalid credentials');
        }

        const passwordsMatch = await PasswordManager.compare(existingUser.password, password);

        if (!passwordsMatch) {
            throw new BadRequestError('Invalid credentials');
        }

        const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        },
            process.env.JWT_KEY! // the ! makes TypeScript happy
        );

        req.session = {
            jwt: userJwt
        };

        return res.status(200).send(existingUser);
    }
);

export { router as signinRouter };
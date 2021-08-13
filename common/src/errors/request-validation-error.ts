import { ValidationError } from 'express-validator';
import { CustomError } from '../errors/custom-error';

export class RequestValidationError extends CustomError {
    statusCode = 400;

    // errors is a class property
    constructor(public errors: ValidationError[]) {
        super('Error connecting to DB');

        // Only becaseu we are extending a built-in class
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }

    serializeErrors() {
        return this.errors.map(err => {
            return { message: err.msg, field: err.param };
        });
    }
}

import { CustomError } from '../errors/custom-error';

export class BadRequestError extends CustomError {
    statusCode = 400;

    // message is a class property because of 'public'
    constructor(public message: string) {
        super(message);

        Object.setPrototypeOf(this, BadRequestError.prototype);
    }

    serializeErrors() {
        return [{ message: this.message }];
    }


}
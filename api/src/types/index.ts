export class CustomError extends Error {
    statusCode?: number;
    errors?: Record<string, { message: string }>;
    code?: number;
    keyValue?: Record<string, string>;

    constructor(message: string, statusCode?: number, errors? : Record<string, { message: string }>, code?: number,keyValue?: Record<string, string>) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.code = code;
        this.keyValue = keyValue;

        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
    
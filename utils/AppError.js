class AppError extends Error {
    constructor(message, statusCode, errorCode, errorField = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.errorCode = errorCode;
        this.errorField = errorField;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;

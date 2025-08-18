const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";
    const errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";
    const errorField = err.errorField || null;

    if (statusCode === 500) {
        console.error(`[${req.method}] ${req.originalUrl}`);
        console.error(err.stack || err);
    }

    res.status(statusCode).json({
        status,
        message: err.isOperational ? err.message : "Internal server error",
        errorCode,
        errorField,
    });
};

export default errorHandler;

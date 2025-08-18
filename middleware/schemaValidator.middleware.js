import AppError from "../utils/AppError.js";

export const schemaValidator = (schemas) => {
    return async (req, res, next) => {
        const errors = {};

        try {
            if (schemas.body) {
                const hasImage = "image" in schemas.body.describe().keys;
                const data = hasImage
                    ? { ...req.body, image: req.file }
                    : req.body;

                await schemas.body.validateAsync(data, {
                    abortEarly: false,
                    allowUnknown: true,
                    convert: false,
                });
            }

            if (schemas.params) {
                await schemas.params.validateAsync(req.params, {
                    abortEarly: false,
                    allowUnknown: false,
                    convert: false,
                });
            }

            if (schemas.query) {
                await schemas.query.validateAsync(req.query, {
                    abortEarly: false,
                    allowUnknown: true,
                    convert: true,
                });
            }

            next();
        } catch (error) {
            if (error.details) {
                error.details.forEach(({ path: [field], message }) => {
                    errors[field] = errors[field] || message;
                });
            }

            next(
                new AppError(
                    "Invalid request data",
                    401,
                    "VALIDATION_ERROR",
                    errors
                )
            );
        }
    };
};

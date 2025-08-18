import AppError from "../utils/AppError.js";

export const roleValidator = (allowedRoles) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        if (!req.user) {
            return next(
                new AppError(
                    "Anda perlu login untuk mengakses sumber daya ini.",
                    401,
                    "UNAUTHORIZED"
                )
            );
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    "Anda tidak memiliki hak untuk mengakses sumber daya ini.",
                    403,
                    "FORBIDDEN"
                )
            );
        }

        next();
    };
};

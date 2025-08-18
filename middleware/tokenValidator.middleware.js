import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

export function parseAndVerifyToken({ token, type, secretKey }) {
    if (!token) {
        const errorCode =
            {
                accessToken: "ACCESS_TOKEN_MISSING",
                refreshToken: "REFRESH_TOKEN_MISSING",
            }[type] || "NO_AUTH_TOKEN";

        throw new AppError("Silahkan login terlebih dahulu.", 401, errorCode);
    }

    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        let errorMessage = "Token tidak valid.";
        if (error.name === "TokenExpiredError") {
            errorMessage = "Token kadaluarsa. Silakan login kembali.";
        } else if (error.name === "JsonWebTokenError") {
            errorMessage = "Token tidak valid atau format salah.";
        }
        throw new AppError(errorMessage, 401, "TOKEN_VALIDATION_ERROR");
    }
}

export const accessTokenValidator = (secretKey) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            const accessToken = authHeader ? authHeader.split(" ")[1] : null;

            const decoded = parseAndVerifyToken({
                token: accessToken,
                type: "accessToken",
                secretKey,
            });

            req.user = decoded;
            next();
        } catch (error) {
            next(error);
        }
    };
};

export const refreshTokenValidator = (secretKey) => {
    try {
        return (req, res, next) => {
            const refreshToken = req.cookies.refreshToken;
            const decoded = parseAndVerifyToken({
                token: refreshToken,
                type: "refreshToken",
                secretKey,
            });
            req.user = decoded;
            next();
        };
    } catch (error) {
        next(error);
    }
};

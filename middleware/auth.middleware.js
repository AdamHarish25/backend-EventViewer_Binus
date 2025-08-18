import AppError from "../utils/AppError.js";
import db from "../model/index.js";

export const authenticateBlacklistedToken = async (req, res, next) => {
    const BlacklistedTokenModel = db.BlacklistedToken;
    const token = req.headers.authorization.split(" ")[1];

    try {
        const isBlacklisted = await BlacklistedTokenModel.findOne({
            where: { userId: req.user.id, token },
        });

        if (isBlacklisted) {
            throw new AppError(
                "Token telah diblacklist",
                403,
                "TOKEN_BLACKLISTED"
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};

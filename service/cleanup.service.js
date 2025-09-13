import { Op } from "sequelize";
import db from "../model/index.js";
import logger from "../utils/logger.js";

const { OTP, RefreshToken, BlacklistedToken } = db;

export const runCleanupTasks = async () => {
    try {
        const now = new Date();

        // Hapus OTP
        const otpCount = await OTP.destroy({
            where: {
                [Op.or]: [
                    { expiresAt: { [Op.lt]: now } },
                    { valid: false },
                    { verified: true },
                ],
            },
        });
        if (otpCount > 0) logger.info(`Cleaned up ${otpCount} expired OTPs.`);

        // Hapus RefreshToken
        const refreshTokenCount = await RefreshToken.destroy({
            where: { expiresAt: { [Op.lt]: now } },
        });
        if (refreshTokenCount > 0)
            logger.info(
                `Cleaned up ${refreshTokenCount} expired Refresh Tokens.`
            );

        // Hapus BlacklistedToken
        const blacklistedTokenCount = await BlacklistedToken.destroy({
            where: { expiresAt: { [Op.lt]: now } },
        });
        if (blacklistedTokenCount > 0)
            logger.info(
                `Cleaned up ${blacklistedTokenCount} expired Blacklisted Tokens.`
            );
    } catch (error) {
        logger.error("Error during scheduled cleanup task:", error);
    }
};

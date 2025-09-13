import bcrypt from "bcrypt";
import { Op } from "sequelize";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

export const OTP_CONFIG = {
    MAX_ATTEMPTS: 3,
    EXPIRY_MINUTES: 5,
    RATE_LIMIT_WINDOW: 15,
    MAX_REQUESTS_PER_WINDOW: 5,
    BCRYPT_ROUNDS: 12,
    OTP_LENGTH: 6,
};

const validateOTPFormat = (otp) => {
    if (!otp || typeof otp !== "string") {
        throw new AppError("OTP harus berupa string", 400, "INVALID_FORMAT");
    }
    if (otp.length !== OTP_CONFIG.OTP_LENGTH) {
        throw new AppError(
            `OTP harus ${OTP_CONFIG.OTP_LENGTH} digit`,
            400,
            "INVALID_LENGTH"
        );
    }
    if (!/^\d+$/.test(otp)) {
        throw new AppError(
            "OTP hanya boleh berisi angka",
            400,
            "INVALID_CHARACTER"
        );
    }
};

export const validateOTP = async (user, otp, model) => {
    const { OTPModel } = model;
    const isUserExist = await UserModel.findOne({ where: { email } });
    if (!isUserExist) {
        throw new AppError("Email tidak terdaftar", 404, "USER_NOT_FOUND");
    }

    validateOTPFormat(otp);

    logger.info(`OTP validation attempt for user ${user.id}`);

    try {
        const validationResult = await OTPModel.sequelize.transaction(
            async (t) => {
                const otpRecord = await OTPModel.findOne({
                    where: {
                        userId: user.id,
                        verified: false,
                        valid: true,
                        expiresAt: { [Op.gt]: new Date() },
                    },
                    lock: t.LOCK.UPDATE,
                    transaction: t,
                });

                if (!otpRecord) {
                    return { success: false, code: "EXPIRED_OTP" };
                }

                const isValid = await bcrypt.compare(otp, otpRecord.code);

                if (!isValid) {
                    await otpRecord.increment("attempt", {
                        by: 1,
                        transaction: t,
                    });
                    await otpRecord.reload({ transaction: t });
                    const newAttempt = otpRecord.get("attempt");

                    logger.warn(
                        `Invalid OTP attempt ${newAttempt}/${OTP_CONFIG.MAX_ATTEMPTS} for user ${user.id}`
                    );

                    if (newAttempt >= OTP_CONFIG.MAX_ATTEMPTS) {
                        await otpRecord.update(
                            { valid: false },
                            { transaction: t }
                        );
                        logger.warn(
                            `Max attempts exceeded for OTP ${otpRecord.id}. OTP invalidated.`
                        );

                        return {
                            success: false,
                            code: "MAX_ATTEMPTS_EXCEEDED",
                        };
                    }

                    const remainingAttempts =
                        OTP_CONFIG.MAX_ATTEMPTS - newAttempt;

                    return {
                        success: false,
                        code: "INVALID_OTP",
                        remainingAttempts,
                    };
                }

                await otpRecord.update(
                    {
                        valid: false,
                        verified: true,
                        attempt: otpRecord.attempt + 1,
                        verifiedAt: new Date(),
                    },
                    { transaction: t }
                );

                return { success: true };
            }
        );

        if (!validationResult.success) {
            switch (validationResult.code) {
                case "EXPIRED_OTP":
                    throw new AppError(
                        "OTP sudah tidak berlaku atau telah kedaluwarsa",
                        401,
                        "EXPIRED_OTP"
                    );
                case "MAX_ATTEMPTS_EXCEEDED":
                    throw new AppError(
                        "OTP sudah tidak berlaku karena terlalu banyak percobaan",
                        401,
                        "MAX_ATTEMPTS_EXCEEDED"
                    );
                case "INVALID_OTP":
                    throw new AppError(
                        `OTP tidak valid. Sisa percobaan: ${validationResult.remainingAttempts}`,
                        401,
                        "INVALID_OTP"
                    );
                default:
                    throw new AppError(
                        "Terjadi kesalahan validasi OTP",
                        500,
                        "VALIDATION_ERROR"
                    );
            }
        }

        logger.info(`OTP successfully validated for user ${user.id}`);
    } catch (error) {
        if (error instanceof AppError) throw error;
        logger.error(
            `Unexpected error in OTP validation for user ${user.id}:`,
            error
        );
        throw new AppError(
            "Terjadi kesalahan saat validasi OTP",
            500,
            "VALIDATION_ERROR"
        );
    }
};

export const saveOTPToDatabase = async (userId, otp, model, transaction) => {
    const { OTPModel } = model;

    try {
        logger.info(`Saving new OTP for user ${userId}`);

        const otpHash = await bcrypt.hash(otp, OTP_CONFIG.BCRYPT_ROUNDS);

        await OTPModel.update(
            { valid: false, invalidatedAt: new Date() },
            {
                where: {
                    userId,
                    verified: false,
                    valid: true,
                    attempt: { [Op.lt]: OTP_CONFIG.MAX_ATTEMPTS },
                    expiresAt: { [Op.gt]: new Date() },
                },
                transaction,
            }
        );

        // Buat OTP baru
        const expiresAt = new Date(
            Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000
        );
        const newOTP = await OTPModel.create(
            {
                userId,
                code: otpHash,
                expiresAt,
                attempt: 0,
                valid: true,
                verified: false,
            },
            { transaction }
        );

        logger.info(
            `New OTP created with ID ${newOTP.id} for user ${userId}, expires at ${expiresAt}`
        );
        return newOTP;
    } catch (error) {
        if (error instanceof AppError) throw error;
        logger.error(`Error saving OTP for user ${userId}:`, error);
        throw new AppError("Gagal menyimpan OTP", 500, "SAVE_ERROR");
    }
};

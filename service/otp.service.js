import bcrypt from "bcrypt";
import { Op } from "sequelize";

import AppError from "../utils/AppError.js";

export const validateOTP = async (user, otp, model) => {
    const { OTPModel } = model;

    const otpRecord = await OTPModel.findOne({
        where: {
            userId: user.id,
            verified: false,
            valid: true,
            expiresAt: { [Op.gt]: new Date() },
        },
    });

    if (!otpRecord) {
        throw new AppError("OTP sudah tidak berlaku", 401, "EXPIRED_OTP");
    }

    if (otpRecord.attempt >= 3) {
        await OTPModel.update(
            { valid: false },
            { where: { id: otpRecord.id } }
        );
        throw new AppError("OTP sudah tidak berlaku", 401, "EXPIRED_OTP");
    }

    const isValid = await bcrypt.compare(otp, otpRecord.code);
    if (!isValid) {
        await OTPModel.update(
            { attempt: otpRecord.attempt + 1 },
            { where: { id: otpRecord.id } }
        );
        throw new AppError("OTP tidak valid", 401, "INVALID_OTP");
    }

    await OTPModel.update(
        { valid: false, verified: true, attempt: otpRecord.attempt + 1 },
        { where: { id: otpRecord.id } }
    );
};

export const saveOTPToDatabase = async (userId, otp, model, transaction) => {
    const { OTPModel } = model;
    const otpHash = await bcrypt.hash(otp, 10);

    const otpRecord = await OTPModel.findOne({
        where: {
            userId,
            verified: false,
            valid: true,
            attempt: { [Op.lt]: 3 },
            expiresAt: { [Op.gt]: new Date() },
        },
        transaction,
    });

    if (otpRecord) {
        await OTPModel.update(
            { valid: false },
            { where: { id: otpRecord.id }, transaction }
        );
    }

    await OTPModel.create(
        {
            userId,
            code: otpHash,
            expiresAt: Date.now() + 5 * 60 * 1000,
            attempt: 0,
            valid: true,
        },
        { transaction }
    );
};

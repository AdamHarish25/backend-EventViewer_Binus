import crypto from "crypto";

import db from "../model/index.js";
import {
    requestPasswordReset,
    resetPasswordHandler,
} from "../service/auth.service.js";
import { validateOTP } from "../service/otp.service.js";
import { saveResetTokenToDatabase } from "../service/token.service.js";
import AppError from "../utils/AppError.js";

export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    const model = {
        UserModel: db.User,
        OTPModel: db.OTP,
    };
    try {
        await requestPasswordReset(email, model);
        res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
        next(error);
    }
};

export const verifyOTP = async (req, res, next) => {
    const { email, otp } = req.body;
    const model = {
        OTPModel: db.OTP,
        ResetTokenModel: db.ResetToken,
    };

    const user = await db.User.findOne({ where: { email } });
    if (!user || user.length === 0) {
        throw new AppError("Email tidak terdaftar", 404, "USER_NOT_FOUND");
    }

    try {
        await validateOTP(user, otp, model);
        const resetToken = crypto.randomBytes(32).toString("hex");
        await saveResetTokenToDatabase(user, resetToken, model);

        res.status(200).json({
            status: "success",
            message: "OTP verified successfully",
            resetToken,
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    const { email, password: newPassword, resetToken } = req.body;
    const model = {
        UserModel: db.User,
        ResetTokenModel: db.ResetToken,
    };

    try {
        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            throw new AppError("Email tidak terdaftar", 404, "USER_NOT_FOUND");
        }

        await resetPasswordHandler(user, newPassword, model, resetToken);
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        next(error);
    }
};

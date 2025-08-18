import bcrypt from "bcrypt";
import dotenv from "dotenv";

import getToken from "../utils/getToken.js";
import { saveNewRefreshToken } from "../service/token.service.js";
import { sendOTPEmail } from "../utils/emailSender.js";
import { saveOTPToDatabase } from "../service/otp.service.js";
import { generateOTP } from "../utils/otpGenerator.js";
import AppError from "../utils/AppError.js";
import db from "../model/index.js";

dotenv.config({ path: "../.env" });

export const handleUserLogin = async (data, model, deviceName) => {
    const { email, password } = data;
    const { UserModel, RefreshTokenModel } = model;

    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
        throw new AppError(
            "Email atau Password salah.",
            401,
            "CLIENT_AUTH_ERROR"
        );
    }

    const result = await bcrypt.compare(password, user.password);
    if (!result) {
        throw new AppError(
            "Email atau Password salah.",
            401,
            "CLIENT_AUTH_ERROR"
        );
    }

    const payload = { id: user.id, role: user.role };
    const { accessToken, refreshToken } = getToken(payload);

    await saveNewRefreshToken(
        user.id,
        refreshToken,
        RefreshTokenModel,
        deviceName
    );

    const userProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };

    return { user: userProfile, accessToken, refreshToken };
};

export const handleUserLogout = async (token, model, userId) => {
    const { RefreshTokenModel, BlacklistedTokenModel } = model;
    const { accessTokenFromUser, refreshTokenFromUser } = token;

    const allRefreshTokenFromDB = await RefreshTokenModel.findAll({
        where: { ownerId: userId, isRevoked: false },
    });

    // kalo ga ditemuin ada tiga kemungkinan
    // 1. Sistem gagal menyimpan refresh token ke database
    // 2. User mengirimkan refresh token orang lain
    // 3. Refresh token yang valid sudah dicabut
    if (!allRefreshTokenFromDB || allRefreshTokenFromDB.length === 0) {
        throw new AppError(
            "Refresh token tidak ditemukan",
            404,
            "CLIENT_AUTH_ERROR"
        );
    }

    let theRightRefreshToken;
    for (const tokenRecord of allRefreshTokenFromDB) {
        const isMatch = await bcrypt.compare(
            refreshTokenFromUser,
            tokenRecord.token
        );

        if (isMatch) {
            theRightRefreshToken = tokenRecord.token;
            break;
        }
    }

    await RefreshTokenModel.update(
        { isRevoked: true },
        { where: { ownerId: userId, token: theRightRefreshToken } }
    );

    await BlacklistedTokenModel.create({
        token: accessTokenFromUser,
        userId,
        reason: "logout",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
};

export const requestPasswordReset = async (email, model) => {
    const { sequelize } = db;
    const { UserModel } = model;

    const user = await UserModel.findOne({ where: { email } });
    if (!user) {
        throw new AppError("Email tidak terdaftar", 404, "CLIENT_AUTH_ERROR");
    }

    const otp = generateOTP();
    const mailOptions = {
        from: `BINUS Event Viewer <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Reset Password - Kode OTP`,
        html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Reset Password</title>
                    </head>
                    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #333333; font-size: 24px; margin: 0;">Reset Password</h1>
                            </div>
                            
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                                <p style="color: #666666; font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">
                                    Kami menerima permintaan untuk mereset password akun Anda. Gunakan kode OTP berikut untuk melanjutkan proses reset password.
                                </p>
                                
                                <div style="text-align: center; margin: 25px 0;">
                                    <div style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 15px 30px; border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
                                        ${otp}
                                    </div>
                                </div>
                                
                                <p style="color: #666666; font-size: 14px; margin: 15px 0 0 0; text-align: center;">
                                    Kode ini akan kedaluwarsa dalam <strong>5 menit</strong>
                                </p>
                            </div>
                            
                            <div style="border-top: 1px solid #e9ecef; padding-top: 20px;">
                                <p style="color: #999999; font-size: 12px; line-height: 1.4; margin: 0;">
                                    Jika Anda tidak meminta reset password, abaikan email ini. Password Anda akan tetap aman.
                                    <br><br>
                                    Email ini dikirim secara otomatis, mohon tidak membalas email ini.
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
    };
    try {
        await sequelize.transaction(async (transaction) => {
            await saveOTPToDatabase(user.id, otp, model, transaction);
            await sendOTPEmail(mailOptions, email);
        });
    } catch (error) {
        console.error(
            `[TRANSACTION_FAILED] Gagal memproses OTP untuk ${email}.`,
            {
                errorMessage: error.message,
                errorCode: error.code,
                errorName: error.name,
                stack: error.stack,
            }
        );

        if (error.code && error.code.startsWith("E")) {
            throw new AppError(
                "Gagal mengirimkan email verifikasi. Silakan coba beberapa saat lagi.",
                502,
                "EMAIL_SERVICE_ERROR"
            );
        }

        throw new AppError(
            "Terjadi kesalahan internal yang tidak terduga. Tim kami telah diberitahu.",
            500,
            "UNKNOWN_TRANSACTION_ERROR"
        );
    }
};

// export const requestPasswordReset = async (email, model) => {
//     const user = await model.UserModel.findOne({
//         where: { email },
//     });

//     if (!user || user.length === 0) {
//         throw new AppError("Email tidak terdaftar", 404, "CLIENT_AUTH_ERROR");
//     }

//     const otp = generateOTP();

//     // Ga ada yang jamin OTP berhasil disimpan ke db dan dikirim ke user
//     // Butuh penganganan lebih
//     await saveOTPToDatabase(user, otp, model);
//     await sendOTPEmail(email, otp);
// };

export const resetPasswordHandler = async (
    user,
    newPassword,
    model,
    resetToken
) => {
    const { UserModel, ResetTokenModel } = model;

    const tokenRecord = await ResetTokenModel.findAll({
        where: { userId: user.id, verified: false },
    });
    if (!tokenRecord) {
        throw new AppError(
            "Invalid or expired reset token",
            403,
            "INVALID_TOKEN"
        );
    }

    let matchedData = null;
    for (const dataRow of tokenRecord) {
        const isMatch = await bcrypt.compare(resetToken, dataRow.token);

        if (isMatch) {
            console.log("Token cocok! Data ditemukan.");
            matchedData = dataRow;
            break;
        }
    }

    if (!matchedData) {
        throw new AppError(
            "Invalid or expired reset token",
            403,
            "INVALID_TOKEN"
        );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.update(
        { password: hashedNewPassword },
        { where: { id: user.id } }
    );

    await ResetTokenModel.destroy({
        where: { userId: user.id, token: matchedData.token },
    });
};

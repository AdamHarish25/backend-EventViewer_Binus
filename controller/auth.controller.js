import bcrypt from "bcrypt";

import db from "../model/index.js";
import extractDeviceInfo from "../utils/deviceInfo.js";
import { renewAccessToken } from "../service/token.service.js";
import { handleUserLogin, handleUserLogout } from "../service/auth.service.js";
import AppError from "../utils/AppError.js";

export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await db.User.create({
            role,
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });
        return res.status(201).json({ message: "user Created", data: newUser });
    } catch (error) {
        console.error(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const data = { email: req.body.email, password: req.body.password };
        const model = {
            UserModel: db.User,
            RefreshTokenModel: db.RefreshToken,
        };
        const { deviceName } = extractDeviceInfo(req);

        // handleUserLogin akan mengembalikan data user lengkap
        const { user, accessToken, refreshToken } = await handleUserLogin(
            data,
            model,
            deviceName
        );

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Lebih aman untuk produksi
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 hari
            path: "/",
        });

        // --- PERBAIKAN DI SINI ---
        // Kirim data user yang relevan termasuk firstName
        res.status(200).json({
            message: "Login Success !",
            userId: user.id,
            firstName: user.firstName, // <-- Menggunakan properti yang benar
            email: user.email,
            role: user.role,
            accessToken,
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization.split(" ")[1];
        const refreshToken = req.cookies.refreshToken;

        const model = {
            RefreshTokenModel: db.RefreshToken,
            BlacklistedTokenModel: db.BlacklistedToken,
        };

        const token = {
            accessTokenFromUser: accessToken,
            refreshTokenFromUser: refreshToken,
        };

        await handleUserLogout(token, model, req.user.id);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
        });

        res.status(200).json({
            message: "Logout Successfully.",
        });
    } catch (error) {
        next(error);
    }
};

export const refreshAccessToken = async (req, res, next) => {
    try {
        const model = { RefreshTokenModel: db.RefreshToken };
        const oldRefreshToken = req.cookies.refreshToken;

        const { newAccessToken, newRefreshToken } = await renewAccessToken(
            req.user,
            model,
            oldRefreshToken
        );

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 1000 * 60 * 60 * 24 * 7,
            path: "/",
        });

        res.status(200).json({
            message: "Access Token Sent Successfully !",
            accessToken: newAccessToken,
        });
    } catch (error) {
        next(error);
    }
};

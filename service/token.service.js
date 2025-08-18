import bcrypt from "bcrypt";
import getToken from "../utils/getToken.js";
import AppError from "../utils/AppError.js";

export const saveNewRefreshToken = async (
    userId,
    newRefreshToken,
    RefreshTokenModel,
    deviceName
) => {
    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const userRefreshTokens = await RefreshTokenModel.findAll({
        where: { ownerId: userId },
        order: [["expiresAt", "ASC"]],
    });

    const revokedToken = userRefreshTokens.find(
        (token) => token.isRevoked === true
    );

    const tokenData = {
        token: hashedNewRefreshToken,
        isRevoked: false,
        expiresAt,
    };

    if (revokedToken) {
        await RefreshTokenModel.update(tokenData, {
            where: { id: revokedToken.id },
        });
    } else if (userRefreshTokens.length < 3) {
        await RefreshTokenModel.create({
            ...tokenData,
            ownerId: userId,
            device: deviceName,
        });
    } else {
        const oldestToken = userRefreshTokens[0];
        await RefreshTokenModel.update(tokenData, {
            where: { id: oldestToken.id },
        });
    }
};

export const renewAccessToken = async (user, model, oldRefreshToken) => {
    const { RefreshTokenModel } = model;
    const refreshTokenList = await RefreshTokenModel.findAll({
        where: { ownerId: user.id, isRevoked: false },
    });

    if (!refreshTokenList || refreshTokenList.length === 0) {
        throw new AppError(
            "Tidak ada refresh token yang valid ditemukan. Silahkan login terlebih dahulu.",
            404,
            "CLIENT_AUTH_ERROR"
        );
    }

    let tokenRecord = "";
    for (const refreshToken of refreshTokenList) {
        const isMatch = await bcrypt.compare(
            oldRefreshToken,
            refreshToken.token
        );
        if (isMatch) {
            tokenRecord = refreshToken;
            break;
        }
    }

    if (!tokenRecord) {
        throw new AppError(
            "Tidak ada refresh token yang valid ditemukan. Silahkan login terlebih dahulu.",
            404,
            "CLIENT_AUTH_ERROR"
        );
    }

    const payload = { id: user.id, role: user.role };
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        getToken(payload);

    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await RefreshTokenModel.update(
        {
            token: hashedNewRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
            where: { ownerId: user.id, token: tokenRecord.token },
        }
    );

    return { newAccessToken, newRefreshToken };
};

export const saveResetTokenToDatabase = async (user, resetToken, model) => {
    const { ResetTokenModel } = model;

    const hashedResetToken = await bcrypt.hash(resetToken, 10);
    await ResetTokenModel.create({
        userId: user.id,
        token: hashedResetToken,
        expiresAt: Date.now() + 5 * 60 * 1000,
    });
};

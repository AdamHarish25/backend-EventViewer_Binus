import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
const { ACCESS_JWT_SECRET, REFRESH_JWT_SECRET } = process.env;

const getAccessToken = (payload) => {
    const newAccessToken = jwt.sign(
        payload,
        ACCESS_JWT_SECRET,
        { expiresIn: "15m" },
        { algorithm: "HS256" }
    );
    return newAccessToken;
};

const getRefreshToken = (payload) => {
    const newRefreshToken = jwt.sign(
        payload,
        REFRESH_JWT_SECRET,
        { expiresIn: "7d" },
        { algorithm: "HS256" }
    );
    return newRefreshToken;
};

export default function getToken(payload) {
    return {
        accessToken: getAccessToken(payload),
        refreshToken: getRefreshToken(payload),
    };
}

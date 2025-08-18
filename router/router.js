import express from "express";
import dotenv from "dotenv";
import {
    accessTokenValidator,
    refreshTokenValidator,
} from "../validator/validator.js";
import { loginValidator } from "../middleware/loginValidator.js";
import { loginValidatorSchema } from "../validator/validator.js";
import {
    login,
    logout,
    userRegister,
    eventViewer,
    refreshAccessToken,
} from "../controller/usercontroller.js";
import authenticateBlacklistedToken from "../service/token/blacklistedToken.js";

dotenv.config({ path: "../.env" });

const { ACCESS_JWT_SECRET, REFRESH_JWT_SECRET } = process.env;
const router = express.Router();

router.post("/register", userRegister);
router.post("/login", loginValidator(loginValidatorSchema), login);
router.post("/logout", accessTokenValidator(ACCESS_JWT_SECRET), logout);
router.get(
    "/event",
    accessTokenValidator(ACCESS_JWT_SECRET),
    authenticateBlacklistedToken,
    eventViewer
);
router.post(
    "/token",
    refreshTokenValidator(REFRESH_JWT_SECRET),
    refreshAccessToken
);
// router.post("/admin-dashboard", authorizeRole("admin"));
// router.post("/supadmin-dashboard", authorizeRole("supadmin"));

// router.delete("/user-delete", deleteUser);

export default router;

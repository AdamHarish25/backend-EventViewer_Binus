import express from "express";
import dotenv from "dotenv";

import { loginValidatorSchema } from "../validator/auth.validator.js";
import { schemaValidator } from "../middleware/schemaValidator.middleware.js";
import {
    accessTokenValidator,
    refreshTokenValidator,
} from "../middleware/tokenValidator.middleware.js";
import {
    register,
    login,
    logout,
    refreshAccessToken,
} from "../controller/auth.controller.js";
import { registerValidatorSchema } from "../validator/auth.validator.js";

dotenv.config({ path: "../.env" });

const { ACCESS_JWT_SECRET, REFRESH_JWT_SECRET } = process.env;
const router = express.Router();

router.post("/register", schemaValidator({ body: registerValidatorSchema }), register);
router.post("/login", schemaValidator({ body: loginValidatorSchema }), login);
router.post(
    "/logout",
    accessTokenValidator(ACCESS_JWT_SECRET),
    refreshTokenValidator(REFRESH_JWT_SECRET),
    logout
);
router.get(
    "/token",
    refreshTokenValidator(REFRESH_JWT_SECRET),
    refreshAccessToken
);

export default router;

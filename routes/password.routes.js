import express from "express";
import dotenv from "dotenv";

import {
    emailValidatorSchema,
    passwordValidatorSchema,
    otpValidatorSchema,
} from "../validator/auth.validator.js";
import { schemaValidator } from "../middleware/schemaValidator.middleware.js";
import {
    forgotPassword,
    verifyOTP,
    resetPassword,
} from "../controller/password.controller.js";

dotenv.config({ path: "../.env" });
const router = express.Router();

router.post(
    "/forgot-password",
    schemaValidator({ body: emailValidatorSchema }),
    forgotPassword
);

router.post(
    "/verify-otp",
    schemaValidator({ body: otpValidatorSchema }),
    verifyOTP
);

router.post(
    "/reset-password",
    schemaValidator({ body: passwordValidatorSchema }),
    resetPassword
);

export default router;

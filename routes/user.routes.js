import express from "express";
import dotenv from "dotenv";

import { accessTokenValidator } from "../middleware/tokenValidator.middleware.js";
import { eventViewer } from "../controller/user.controller.js";
import { authenticateBlacklistedToken } from "../middleware/auth.middleware.js";

dotenv.config({ path: "../.env" });

const { ACCESS_JWT_SECRET } = process.env;
const router = express.Router();

router.get(
    "/event/",
    accessTokenValidator(ACCESS_JWT_SECRET),
    authenticateBlacklistedToken,
    eventViewer
);

export default router;

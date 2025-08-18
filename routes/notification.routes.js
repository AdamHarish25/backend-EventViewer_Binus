import express from "express";
import dotenv from "dotenv";

import { accessTokenValidator } from "../middleware/tokenValidator.middleware.js";
import {
    getNotification,
    markAsRead,
} from "../controller/notification.controller.js";

dotenv.config({ path: "../.env" });
const { ACCESS_JWT_SECRET } = process.env;
const router = express.Router();

router.get(
    "/get-notification",
    accessTokenValidator(ACCESS_JWT_SECRET),
    getNotification
);

router.patch(
    "/:notificationId/read",
    accessTokenValidator(ACCESS_JWT_SECRET),
    markAsRead
);

export default router;

import express from "express";
import dotenv from "dotenv";

import { accessTokenValidator } from "../middleware/tokenValidator.middleware.js";
import {
    eventViewer,
    createEvent,
    deleteEvent,
    createFeedback,
    editEvent,
    rejectEvent,
    approveEvent,
} from "../controller/event.controller.js";
import { authenticateBlacklistedToken } from "../middleware/auth.middleware.js";
import { roleValidator } from "../middleware/permission.middleware.js";
import { schemaValidator } from "../middleware/schemaValidator.middleware.js";
import {
    createEventSchema,
    updateEventSchema,
    feedbackSchema,
    paramsSchema,
} from "../validator/event.validator.js";
import uploadPoster from "../middleware/uploadPoster.middleware.js";
import handleMulter from "../middleware/handleMulter.js";

dotenv.config({ path: "../.env" });

const { ACCESS_JWT_SECRET } = process.env;
const router = express.Router();

router.get(
    "/get-event",
    accessTokenValidator(ACCESS_JWT_SECRET),
    authenticateBlacklistedToken,
    eventViewer
);

router.post(
    "/create-event",
    accessTokenValidator(ACCESS_JWT_SECRET),
    roleValidator("admin"),
    handleMulter(uploadPoster.single("image")),
    schemaValidator({ body: createEventSchema }),
    createEvent
);

router.delete(
    "/delete-event/:id",
    accessTokenValidator(ACCESS_JWT_SECRET),
    roleValidator("admin"),
    schemaValidator({ params: paramsSchema }),
    deleteEvent
);

router.post(
    "/:eventId/feedback",
    accessTokenValidator(ACCESS_JWT_SECRET),
    roleValidator("super_admin"),
    schemaValidator({ body: feedbackSchema }),
    createFeedback
);

router.patch(
    "/:eventId",
    accessTokenValidator(ACCESS_JWT_SECRET),
    roleValidator("admin"),
    handleMulter(uploadPoster.single("image")),
    schemaValidator({ body: updateEventSchema }),
    editEvent
);

router.post(
    "/:id/reject",
    accessTokenValidator(ACCESS_JWT_SECRET),
    roleValidator("super_admin"),
    schemaValidator({ params: paramsSchema }),
    rejectEvent
);

router.post(
    "/:id/approve",
    accessTokenValidator(ACCESS_JWT_SECRET),
    roleValidator("super_admin"),
    schemaValidator({ params: paramsSchema }),
    approveEvent
);

export default router;

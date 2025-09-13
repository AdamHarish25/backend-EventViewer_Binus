import express from "express";
import authRoutes from "./auth.routes.js";
import passwordRoutes from "./password.routes.js";
import eventRoutes from "./event.routes.js";
import notificationRoutes from "./notification.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/password", passwordRoutes);
router.use("/event", eventRoutes);
router.use("/notification", notificationRoutes);

export default router;

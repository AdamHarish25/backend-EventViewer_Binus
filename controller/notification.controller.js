import {
    getNotificationService,
    markAsReadService,
} from "../service/notification.service.js";
import db from "../model/index.js";

export const getNotification = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const page = req.query.page || 1;
        const limit = req.query.limit || 10;

        const result = await getNotificationService(
            userId,
            page,
            limit,
            db.Notification
        );

        res.json({
            status: "success",
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        await markAsReadService(
            req.params.notificationId,
            req.user.id,
            db.Notification
        );

        res.status(200).json({
            status: "success",
            message: "Notification successfully marked as read",
        });
    } catch (error) {
        next(error);
    }
};

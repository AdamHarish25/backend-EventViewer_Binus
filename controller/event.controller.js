import {
    handleDeleteEvent,
    saveNewEventAndNotify,
    sendFeedback,
    editEventService,
    rejectEventService,
    approveEventService,
    getCategorizedEventsService,
    getPaginatedEventsService,
} from "../service/event.service.js";
import db from "../model/index.js";
import AppError from "../utils/AppError.js";

export const eventViewer = async (req, res, next) => {
    const eventDataFetchers = {
        student: getCategorizedEventsService,
        admin: getPaginatedEventsService,
        super_admin: getPaginatedEventsService,
    };

    try {
        const { id: userId, role } = req.user;
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit) || 10)
        );

        const fetcher = eventDataFetchers[role];

        if (!fetcher) {
            throw new AppError(
                "Kamu tidak memiliki hak untuk melihat sumberdaya ini.",
                403,
                "FORBIDDEN"
            );
        }

        const eventData = await fetcher({
            userId,
            role,
            page,
            limit,
            EventModel: db.Event,
        });

        res.status(200).json({
            status: "success",
            data: eventData,
        });
    } catch (error) {
        next(error);
    }
};

export const createEvent = async (req, res, next) => {
    const model = {
        UserModel: db.User,
        EventModel: db.Event,
        NotificationModel: db.Notification,
    };

    try {
        await saveNewEventAndNotify(req.user.id, req.body, req.file, model);

        res.status(200).json({
            status: "success",
            message: "Event Successly Created",
        });
    } catch (error) {
        next(error);
    }
};

export const deleteEvent = async (req, res, next) => {
    const model = {
        UserModel: db.User,
        EventModel: db.Event,
        NotificationModel: db.Notification,
    };

    try {
        await handleDeleteEvent(req.user.id, req.params.eventId, model);

        res.status(200).json({
            status: "success",
            message: "Event Successly Deleted",
        });
    } catch (error) {
        next(error);
    }
};

export const createFeedback = async (req, res, next) => {
    const model = {
        EventModel: db.Event,
        NotificationModel: db.Notification,
    };

    try {
        const { eventId } = req.params;
        const { feedback } = req.body;

        await sendFeedback(eventId, req.user.id, feedback, model);

        res.status(201).json({
            status: "success",
            message: "Feedback berhasil dikirim.",
        });
    } catch (error) {
        next(error);
    }
};

export const editEvent = async (req, res, next) => {
    const model = {
        UserModel: db.User,
        EventModel: db.Event,
        NotificationModel: db.Notification,
    };

    try {
        const eventId = req.params.eventId;
        const adminId = req.user.id;
        const data = req.body;
        const image = req.file;

        console.log(
            "Data yang ingin diupdate adalah : ",
            eventId,
            adminId,
            data,
            image
        );

        await editEventService(eventId, adminId, data, image, model);

        res.status(200).json({
            status: "success",
            message: "Event berhasil diperbarui.",
        });
    } catch (error) {
        next(error);
    }
};

export const rejectEvent = async (req, res, next) => {
    const model = {
        EventModel: db.Event,
        NotificationModel: db.Notification,
    };

    try {
        const eventId = req.params.eventId;
        const superAdminId = req.user.id;

        console.log(
            "Event yang ingin ditolak adalah : ",
            eventId,
            superAdminId
        );
        await rejectEventService(
            eventId,
            superAdminId,
            req.body.feedback,
            model
        );

        res.status(200).json({
            status: "success",
            message: "Event berhasil ditolak.",
        });
    } catch (error) {
        next(error);
    }
};

export const approveEvent = async (req, res, next) => {
    const model = {
        EventModel: db.Event,
        NotificationModel: db.Notification,
    };

    try {
        const eventId = req.params.eventId;
        const superAdminId = req.user.id;

        console.log(
            "Event yang ingin disetujui adalah : ",
            eventId,
            superAdminId
        );
        await approveEventService(eventId, superAdminId, model);

        res.status(200).json({
            status: "success",
            message: "Event berhasil disetujui.",
        });
    } catch (error) {
        next(error);
    }
};

import {
    handleDeleteEvent,
    saveNewEventAndNotify,
    sendFeedback,
    editEventService,
    rejectEventService,
    approveEventService,
} from "../service/event.service.js";
import db from "../model/index.js";

export const eventViewer = async (req, res, next) => {
    try {
        const event = await db.Event.findAll();
        res.json({
            status: "success",
            message: "Event Viewer",
            event: event,
            user: req.user,
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
    try {
        await handleDeleteEvent(req.params.id, db.Event);

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
        const eventId = req.params.id;
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
        const eventId = req.params.id;
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

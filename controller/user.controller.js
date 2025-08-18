import db from "../model/index.js";
import { getCategorizedEventsService } from "../service/event.service.js";

export const eventViewer = async (req, res, next) => {
    try {
        const { current, thisWeek, next } = await getCategorizedEventsService(
            db.Event
        );

        res.json({
            status: "success",
            event: { current, thisWeek, next },
        });
    } catch (error) {
        next(error);
    }
};

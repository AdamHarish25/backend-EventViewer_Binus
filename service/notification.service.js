import AppError from "../utils/AppError.js";

export const getNotificationService = async (
    userId,
    page,
    limit,
    NotificationModel
) => {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    try {
        const { count, rows } = await NotificationModel.findAndCountAll({
            where: {
                recipientId: userId,
            },
            limit: limitNum,
            offset,
            order: [["createdAt", "DESC"]],
        });

        return {
            data: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limitNum),
                currentPage: pageNum,
                pageSize: limitNum,
            },
        };
    } catch (error) {
        console.error("Gagal mengambil notifikasi:", error);
        throw error;
    }
};

export const markAsReadService = async (
    notificationId,
    userId,
    NotificationModel
) => {
    try {
        const [updatedRows] = await NotificationModel.update(
            { isRead: true },
            {
                where: {
                    id: notificationId,
                    recipientId: userId,
                },
            }
        );

        if (updatedRows === 0) {
            throw new AppError("Notifikasi tidak ditemukan.", 404, "NOT_FOUND");
        }

        return true;
    } catch (error) {
        console.error("Gagal menandai notifikasi sebagai dibaca:", error);
        throw error;
    }
};

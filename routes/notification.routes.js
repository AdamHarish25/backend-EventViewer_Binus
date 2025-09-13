import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import { accessTokenValidator } from "../middleware/tokenValidator.middleware.js";
import {
    getNotification,
    markAsRead,
} from "../controller/notification.controller.js";
import { authenticateBlacklistedToken } from "../middleware/auth.middleware.js";
import { schemaValidator } from "../middleware/schemaValidator.middleware.js";
import { notificationParamsSchema } from "../validator/notification.validator.js";

dotenv.config({ path: "../.env" });
const { ACCESS_JWT_SECRET } = process.env;

const notificationLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: {
        success: false,
        error: "Terlalu banyak request notifikasi, coba lagi dalam 1 menit",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = express.Router();

/**
 * @openapi
 * /notification:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Mendapatkan daftar notifikasi pengguna
 *     description: |
 *       Mengambil daftar notifikasi untuk pengguna yang sedang login, dengan sistem paginasi.
 *       Endpoint ini memiliki rate limit **30 request per menit**.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman yang ingin ditampilkan.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah notifikasi per halaman.
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar notifikasi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *       401:
 *         description: Unauthorized (Token tidak valid atau tidak ada).
 *       403:
 *         description: Forbidden (Token di-blacklist).
 *       429:
 *         description: Too Many Requests (Rate limit terlampaui).
 */
router.get(
    "/",
    notificationLimiter,
    accessTokenValidator(ACCESS_JWT_SECRET),
    authenticateBlacklistedToken,
    getNotification
);

/**
 * @openapi
 * /notification/{notificationId}/read:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Menandai notifikasi sebagai sudah dibaca
 *     description: |
 *       Mengubah status `isRead` dari sebuah notifikasi menjadi `true`.
 *       Endpoint ini memiliki rate limit **30 request per menit**.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID dari notifikasi yang akan ditandai.
 *     responses:
 *       200:
 *         description: Notifikasi berhasil ditandai sebagai sudah dibaca.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Notification successfully marked as read
 *       401:
 *         description: Unauthorized atau parameter tidak valid.
 *       403:
 *         description: Forbidden (Token di-blacklist).
 *       404:
 *         description: Notifikasi tidak ditemukan atau bukan milik pengguna.
 *       429:
 *         description: Too Many Requests (Rate limit terlampaui).
 */
router.patch(
    "/:notificationId/read",
    notificationLimiter,
    accessTokenValidator(ACCESS_JWT_SECRET),
    authenticateBlacklistedToken,
    schemaValidator({ params: notificationParamsSchema }),
    markAsRead
);

export default router;

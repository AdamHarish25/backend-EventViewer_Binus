import AppError from "../utils/AppError.js";

const handleMulter = (multerMiddleware) => {
    return (req, res, next) => {
        multerMiddleware(req, res, (err) => {
            if (!err) return next();

            if (err.code === "LIMIT_FILE_SIZE") {
                return next(
                    new AppError(
                        "Ukuran file terlalu besar. Maksimal 10MB.",
                        400
                    )
                );
            }

            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return next(
                    new AppError("Terlalu banyak file yang diupload.", 400)
                );
            }

            if (err instanceof AppError) {
                return next(err);
            }

            return next(
                new AppError(err.message || "Gagal mengupload file.", 500)
            );
        });
    };
};

export default handleMulter;

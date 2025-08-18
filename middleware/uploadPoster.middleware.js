import multer from "multer";

const fileFilter = (req, file, cb) => {
    cb(null, true);
};

//Konfigurasi Multer untuk poster event
const uploadPoster = multer({
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
    },
});

export default uploadPoster;

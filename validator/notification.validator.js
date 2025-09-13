import Joi from "joi";

const uuidV7Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const notificationParamsSchema = Joi.object({
    notificationId: Joi.string().pattern(uuidV7Regex).required().messages({
        "string.pattern.base":
            "Parameter 'notificationId' harus berupa UUID yang valid",
        "any.required": "Parameter 'notificationId' wajib diisi",
        "string.base": "Parameter 'notificationId' harus berupa string",
    }),
});

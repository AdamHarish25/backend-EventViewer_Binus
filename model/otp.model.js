import { uuidv7 } from "uuidv7";

const OTPModel = (sequelize, DataTypes) => {
    const Otp = sequelize.define(
        "Otp",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: () => uuidv7(),
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            verified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            valid: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
            attempt: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: "otps",
            timestamps: true,
            indexes: [
                {
                    name: "otp_verification_idx",
                    fields: ["userId", "code", "verified"],
                },
                {
                    name: "otp_expires_at_idx",
                    fields: ["expiresAt"],
                },
            ],
        }
    );

    Otp.associate = (models) => {
        Otp.belongsTo(models.User, { foreignKey: "userId" });
    };

    return Otp;
};

export default OTPModel;

import { uuidv7 } from "uuidv7";

const notificationModel = (sequelize, DataTypes) => {
    const Notification = sequelize.define(
        "Notification",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: () => uuidv7(),
                primaryKey: true,
            },
            eventId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "events",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            senderId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            recipientId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            feedback: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            payload: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            notificationType: {
                type: DataTypes.ENUM(
                    "event_created",
                    "event_revised",
                    "event_approved",
                    "event_rejected"
                ),
                allowNull: false,
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
        },
        {
            tableName: "notifications",
            timestamps: true,
            indexes: [
                {
                    fields: ["recipientId"],
                },
                {
                    fields: ["isRead"],
                },
            ],
        }
    );

    Notification.associate = (models) => {
        Notification.belongsTo(models.Event, {
            foreignKey: "eventId",
            as: "event",
        });

        Notification.belongsTo(models.User, {
            foreignKey: "senderId",
            as: "sender",
        });

        Notification.belongsTo(models.User, {
            foreignKey: "recipientId",
            as: "recipient",
        });
    };

    return Notification;
};

export default notificationModel;

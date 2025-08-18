import { uuidv7 } from "uuidv7";

const eventModel = (sequelize, DataTypes) => {
    const Event = sequelize.define(
        "Event",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: () => uuidv7(),
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            creatorId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onDelete: "CASCADE",
            },
            eventName: {
                type: DataTypes.STRING(70),
                allowNull: false,
            },
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            startTime: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            endTime: {
                type: DataTypes.TIME,
                allowNull: false,
            },
            location: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            speaker: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM(
                    "pending",
                    "revised",
                    "approved",
                    "rejected"
                ),
                allowNull: false,
                defaultValue: "pending",
            },
            imagePublicId: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            imageUrl: {
                type: DataTypes.STRING(2048),
                allowNull: true,
                validate: {
                    isUrl: true,
                },
            },
        },
        {
            tableName: "events",
            timestamps: true,
            indexes: [
                {
                    fields: ["status"],
                },
                {
                    fields: ["date"],
                },
            ],
        }
    );

    Event.associate = (models) => {
        Event.belongsTo(models.User, {
            foreignKey: "creatorId",
            as: "creator",
        });

        Event.hasMany(models.Notification, {
            foreignKey: "eventId",
            as: "notifications",
            onDelete: "CASCADE",
        });
    };

    return Event;
};

export default eventModel;

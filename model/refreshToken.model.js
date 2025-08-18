import { uuidv7 } from "uuidv7";

const refreshTokenModel = (sequelize, DataTypes) => {
    const RefreshToken = sequelize.define(
        "RefreshToken",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: () => uuidv7(),
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            ownerId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            token: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            isRevoked: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            device: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            tableName: "refresh_tokens",
            timestamps: false,
            indexes: [
                {
                    fields: ["ownerId"],
                },
                {
                    fields: ["expiresAt"],
                },
            ],
        }
    );

    RefreshToken.associate = (models) => {
        RefreshToken.belongsTo(models.User, {
            foreignKey: "ownerId",
            onDelete: "CASCADE",
        });
    };

    return RefreshToken;
};

export default refreshTokenModel;

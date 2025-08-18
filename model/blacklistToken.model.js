import { uuidv7 } from "uuidv7";

const blacklistedTokenModel = (sequelize, DataTypes) => {
    const BlacklistedToken = sequelize.define(
        "BlacklistedToken",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: () => uuidv7(),
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            token: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            reason: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            tableName: "blacklisted_tokens",
            timestamps: true,
            indexes: [
                {
                    fields: ["expiresAt"],
                    name: "expires_at_idx",
                },
                {
                    fields: ["userId"],
                    name: "user_id_idx",
                },
            ],
        }
    );

    BlacklistedToken.associate = (models) => {
        BlacklistedToken.belongsTo(models.User, {
            foreignKey: "userId",
            onDelete: "CASCADE",
        });
    };

    return BlacklistedToken;
};

export default blacklistedTokenModel;

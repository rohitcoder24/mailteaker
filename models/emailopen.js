'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmailOpen extends Model {
    static associate(models) {
      EmailOpen.belongsTo(models.Email, { foreignKey: 'email_id', as: 'email' });
    }
  }

  EmailOpen.init(
    {
      email_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      referer: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      opened_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      open_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'EmailOpen',
      tableName: 'email_opens',
    }
  );

  return EmailOpen;
};

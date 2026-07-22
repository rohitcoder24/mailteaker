'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GmailAccount extends Model {
    static associate(models) {
      GmailAccount.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  GmailAccount.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gmail_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      access_token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expiry_date: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'GmailAccount',
      tableName: 'gmail_accounts',
    }
  );

  return GmailAccount;
};

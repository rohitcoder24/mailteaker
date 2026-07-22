'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Email extends Model {
    static associate(models) {
      Email.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Email.hasMany(models.EmailOpen, { foreignKey: 'email_id', as: 'opens' });
    }
  }

  Email.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gmail_message_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      gmail_thread_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tracking_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        defaultValue: DataTypes.UUIDV4,
      },
      recipient: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'pending',
      },
      sent_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Email',
      tableName: 'emails',
    }
  );

  return Email;
};

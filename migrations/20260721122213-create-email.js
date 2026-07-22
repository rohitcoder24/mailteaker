'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('emails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      gmail_message_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      gmail_thread_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      tracking_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      recipient: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT('long'),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'pending',
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('emails', ['user_id']);
    await queryInterface.addIndex('emails', ['tracking_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('emails');
  },
};

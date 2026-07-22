'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_opens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'emails',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      referer: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      opened_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      open_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
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

    await queryInterface.addIndex('email_opens', ['email_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('email_opens');
  },
};

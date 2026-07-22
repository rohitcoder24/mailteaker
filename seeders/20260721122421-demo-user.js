'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        name: 'Demo User',
        email: 'demo@mailtracker.com',
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'demo@mailtracker.com' });
  },
};

// User Seeder: Seeds farmers, consumers, and admin
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        name: 'farmer_john',
        email: 'farmer_john@example.com',
        password: '$2b$10$hashforfarmer', // bcrypt hash for 'password123'
        role: 'farmer',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'consumer_jane',
        email: 'consumer_jane@example.com',
        password: '$2b$10$hashforconsumer', // bcrypt hash for 'password123'
        role: 'consumer',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'admin_joe',
        email: 'admin_joe@example.com',
        password: '$2b$10$hashforadmin', // bcrypt hash for 'adminpass'
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};

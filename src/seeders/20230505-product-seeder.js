// Product Seeder: Seeds products linked to farmer
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Assuming farmer_john has id 1
    await queryInterface.bulkInsert('Products', [
      {
        name: 'Organic Tomatoes',
        description: 'Fresh organic tomatoes from local farm.',
        price: 3.99,
        stock: 100,
        farmer_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Free-Range Eggs',
        description: 'A dozen free-range eggs.',
        price: 4.50,
        stock: 50,
        farmer_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Products', null, {});
  }
};

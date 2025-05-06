// Order Seeder: Seeds orders, order items, payments, and shipping
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Assuming consumer_jane has id 2, farmer_john has id 1
    await queryInterface.bulkInsert('Orders', [
      {
        user_id: 2,
        status: 'pending',
        total: 8.49,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
    // OrderItems for order id 1
    await queryInterface.bulkInsert('OrderItems', [
      {
        order_id: 1,
        product_id: 1,
        quantity: 1,
        price: 3.99
      },
      {
        order_id: 1,
        product_id: 2,
        quantity: 1,
        price: 4.50
      }
    ], {});
    // Payment for order id 1
    await queryInterface.bulkInsert('Payments', [
      {
        order_id: 1,
        amount: 8.49,
        status: 'paid',
        provider: 'stripe',
        provider_payment_id: 'test_stripe_001',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
    // Shipping for order id 1
    await queryInterface.bulkInsert('Shippings', [
      {
        order_id: 1,
        status: 'processing',
        tracking_number: 'TRACK123',
        provider: 'UPS',
        rate: 5.00,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Shippings', null, {});
    await queryInterface.bulkDelete('Payments', null, {});
    await queryInterface.bulkDelete('OrderItems', null, {});
    await queryInterface.bulkDelete('Orders', null, {});
  }
};

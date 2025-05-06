const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    provider: { type: DataTypes.ENUM('stripe', 'paypal'), allowNull: false },
    provider_payment_id: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'), allowNull: false, defaultValue: 'pending' }
  }, {
    timestamps: true,
    underscored: true
  });

  Payment.associate = (models) => {
    Payment.hasOne(models.Order, { foreignKey: 'payment_id', as: 'order' });
  };

  return Payment;
};

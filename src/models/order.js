const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'), allowNull: false, defaultValue: 'pending' },
    total: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    payment_id: { type: DataTypes.INTEGER },
    shipping_id: { type: DataTypes.INTEGER }
  }, {
    timestamps: true,
    underscored: true
  });

  Order.associate = (models) => {
    Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'order_items' });
    Order.belongsTo(models.Payment, { foreignKey: 'payment_id', as: 'payment' });
    Order.belongsTo(models.Shipping, { foreignKey: 'shipping_id', as: 'shipping' });
  };

  return Order;
};

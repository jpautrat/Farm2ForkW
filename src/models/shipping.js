const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Shipping = sequelize.define('Shipping', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    provider: { type: DataTypes.STRING, allowNull: false },
    tracking_number: { type: DataTypes.STRING },
    rate: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'shipped', 'delivered'), allowNull: false, defaultValue: 'pending' }
  }, {
    timestamps: true,
    underscored: true
  });

  Shipping.associate = (models) => {
    Shipping.hasOne(models.Order, { foreignKey: 'shipping_id', as: 'order' });
  };

  return Shipping;
};

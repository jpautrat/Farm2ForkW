const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false },
    category: { type: DataTypes.STRING },
    image_url: { type: DataTypes.STRING },
    farmer_id: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    timestamps: true,
    underscored: true
  });

  Product.associate = (models) => {
    Product.belongsTo(models.User, { foreignKey: 'farmer_id', as: 'farmer' });
    Product.hasMany(models.OrderItem, { foreignKey: 'product_id', as: 'order_items' });
  };

  return Product;
};

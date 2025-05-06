const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('farmer', 'consumer', 'admin'), allowNull: false, defaultValue: 'consumer' }
  }, {
    timestamps: true,
    underscored: true
  });

  User.associate = (models) => {
    User.hasMany(models.Product, { foreignKey: 'farmer_id', as: 'products' });
    User.hasMany(models.Order, { foreignKey: 'user_id', as: 'orders' });
  };

  return User;
};

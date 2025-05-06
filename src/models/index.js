const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const dbConfig = require('../config/database')[env];

let sequelize;
if (dbConfig.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: dbConfig.dialect,
    storage: dbConfig.storage,
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
      logging: false,
    }
  );
}


const models = {
  User: require('./user')(sequelize),
  Product: require('./product')(sequelize),
  Order: require('./order')(sequelize),
  OrderItem: require('./orderitem')(sequelize),
  Payment: require('./payment')(sequelize),
  Shipping: require('./shipping')(sequelize),
  Cart: require('./cart')(sequelize),
  CartItem: require('./cartitem')(sequelize),
};

Object.values(models).forEach((model) => {
  if (model.associate) model.associate(models);
});

module.exports = { sequelize, ...models };

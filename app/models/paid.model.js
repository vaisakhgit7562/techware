module.exports = (sequelize, Sequelize) => {
  const paid = sequelize.define('paid', {
    paid_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    },
    transaction_id: {
    type: Sequelize.STRING,
    allowNull: false,
    },       
    paid_date: {
    type: Sequelize.DATEONLY,
    allowNull: true,
    },
    amount: {
    type: Sequelize.FLOAT,
    allowNull: true,
    },
  });
  paid.associate = (models) => {
  paid.belongsTo(models.users, {
  foreignKey: 'user_id',
  as: 'users',
  });
  paid.belongsTo(models.payment, {
  foreignKey: 'paymentChittyId',
  as: 'payment',
  });
  };
  return paid;
};

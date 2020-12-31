function generateMyId() {
  let result = "";
  const length = 5;
  const characters = "0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return `Chitty-${result}`;
}
module.exports = (sequelize, Sequelize) => {
  const payment = sequelize.define("payment", {
    paymentChittyId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chitty_no: {
      type: Sequelize.STRING,
      defaultValue: () => generateMyId(),
    },
    issue_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    due_date: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: true,
    },
  });
  payment.associate = (models) => {
    payment.belongsTo(models.payment, {
      foreignKey: "user_id",
      as: "users",
    });
  };
  return payment;
};

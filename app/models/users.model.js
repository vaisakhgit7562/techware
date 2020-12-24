module.exports = (sequelize, Sequelize) => {
  const users = sequelize.define('users', {
    user_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  },
    user_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_dob: {
      type: Sequelize.DATEONLY,
      allowNull: true,
    },
    user_image: {
      type: Sequelize.BLOB("long"),
      allowNull: true,
    },
    user_phone: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_status: {
      type: Sequelize.INTEGER,
    },
  }); 
  return users;
};

require("dotenv").config();

module.exports = {
  development: {
    database: process.env.DB_NAME_DEV,
    username: process.env.DB_USER_DEV,
    password: process.env.DB_PASS_DEV,
    host: process.env.DB_HOST_DEV,
    dialect: process.env.DB_DIAT_DEV,
  },

  test: {
    database: process.env.DB_NAME_TEST,
    username: process.env.DB_USER_TEST,
    password: process.env.DB_PASS_TEST,
    host: process.env.DB_HOST_TEST,
    dialect: process.env.DB_DIAT_TEST,
  },

  production: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIAT,
  },
};

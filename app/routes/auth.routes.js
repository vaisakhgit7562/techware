import { Router } from 'express';

const auth = require('../controllers/auth.controller');
module.exports = (app) => {
  const router = Router();
  router.post('/login', auth.login);
  router.post('/signup', auth.create);
  router.post('/addProduct', auth.addproduct);
  router.post('/forgot_password', auth.forgotPassword);
  app.use('/api',router);
};

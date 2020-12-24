import respObj from '../assets/lang/en.json';
import PaidService from '../services/paid.service';
import Response from '../utils/Response';

const { userAPI } = respObj;
const sanitizer = require('sanitize')();
const response = new Response();
const STRING = 'str';
// Create payment
exports.create = async (req, res) => {
  const post = req.body;
  if (!post.amount) {
  response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_amount);
  response.send(res);
  return;
  }
  if (!post.userId) {
  response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_user);
  response.send(res);
  return;
  }
  if (!post.paymentChittyId) {
  response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_Chitty);
  response.send(res);
  return;
  }
  const user = await PaidService.getUserId(post.userId);
  const paymentChitty= await PaidService.getpayment(post.paymentChittyId);
  if (!user) {
  response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_user);
  response.send(res);
  return;
  }
  if (!paymentChitty) {
  response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_Chitty);
  response.send(res);
  return;
  }
  const payinfo = await PaidService.getpaidinfo(post.userId,post.paymentChittyId);
  if(payinfo) {
  response.setError(process.env.STATUS_BAD_REQUEST, userAPI.already_paid);
  response.send(res);
  return;
  }
  const params = {
    userId: sanitizer.value(post.userId, STRING),
    paymentChittyId: sanitizer.value(post.paymentChittyId, STRING),
    amount: sanitizer.value(post.amount, STRING)   
  };
  const paid_data = {
    user_id: params.userId,
    paymentChittyId: params.paymentChittyId,
    amount: params.amount,
    paid_date: new Date().toISOString().slice(0, 10),
    transaction_id: new Date().valueOf()    
  };
  const PaidData = await PaidService.create(paid_data);
  if (PaidData) {
  response.setSuccess(process.env.STATUS_SUCCESS, userAPI.paid_succes,PaidData);
  response.send(res);
  } else {
  PaidService.remove(transaction_id);
  response.setError(process.env.STATUS_ERROR, userAPI.paid_error);
  response.send(res);
  }
};



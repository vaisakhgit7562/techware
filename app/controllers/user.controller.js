import respObj from '../assets/lang/en.json';
import UserService from '../services/user.service';
import Response from '../utils/Response';
import Email from '../utils/Email';

const email = new Email();
const { userAPI } = respObj;
const response = new Response();

const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

// Retrieve dashboard from the database.
exports.dashboard = async (req, res) => {
  const { id } = req.params;
  const { page, size, type } = req.query;
  const { limit, offset } = getPagination(page, size);
  const Users = await UserService.fetch_dashboard(type, limit, offset, page,id);
  response.setSuccess(process.env.STATUS_SUCCESS, userAPI.fetch_tele, Users);
  response.send(res);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  if (id) {
    const resp = await UserService.updateData(id, data);
    if (resp[0] === 1) {
      response.setSuccess(process.env.STATUS_SUCCESS, userAPI.updated_success);
      response.send(res);
    } else {
      response.setError(process.env.STATUS_ERROR, userAPI.update_failed);
      response.send(res);
    }
  } else {
    response.setError(process.env.STATUS_ERROR, userAPI.no_data);
    response.send(res);
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  if (id) {
    const agent = await UserService.fetchOne(id);
    if (agent) {
      const resp = await UserService.deactive(agent.usersId);
      if (resp[0] === 1) {
        response.setSuccess(process.env.STATUS_SUCCESS, userAPI.deactivated);
        response.send(res);
      } else {
        response.setError(process.env.STATUS_ERROR, userAPI.update_failed);
        response.send(res);
      }
    } else {
      response.setError(process.env.STATUS_ERROR, userAPI.update_failed);
      response.send(res);
    }
  } else {
    response.setError(process.env.STATUS_ERROR, userAPI.no_data);
    response.send(res);
  }
};

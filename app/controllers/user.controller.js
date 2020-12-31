import respObj from "../assets/lang/en.json";
import UserService from "../services/user.service";
import Response from "../utils/Response";
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
  const Users = await UserService.fetch_dashboard(
    type,
    limit,
    offset,
    page,
    id
  );
  response.setSuccess(process.env.STATUS_SUCCESS, userAPI.fetch_tele, Users);
  response.send(res);
};


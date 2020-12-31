import database from "../models/index";
const checkage = 60;
const discount_val = 10;
const fine_val = 5;

const get_age = (time) => {
  let MILLISECONDS_IN_A_YEAR = 1000 * 60 * 60 * 24 * 365;
  let date_array = time.split("-");
  let years_elapsed =
    (new Date() - new Date(date_array[0], date_array[1], date_array[2])) /
    MILLISECONDS_IN_A_YEAR;
  return parseInt(years_elapsed);
};
const get_discount = (discount, total) => {
  let cal = Number(discount) / 100;
  let totalValue = total - total * cal;
  return parseFloat(totalValue).toFixed(2);
};
const get_fine = (percent, amount) => {
  let fine = (percent / 100) * amount;
  let amount_c = parseFloat(fine) + parseFloat(amount);
  return parseFloat(amount_c).toFixed(2);
};

const getPagingData = (datas, page, limit) => {
  const { count: totalItems, rows: data } = datas;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    data,
    totalPages,
    currentPage,
  };
};

class UserService {
  static async fetchAll(type, limit, offset, page) {
    const condition = type ? { type } : null;
    const resp = await database.users.findAndCountAll({
      where: condition,
      limit,
      offset,
    });
    const response = getPagingData(resp, page, limit);
    return response;
  }

  static async fetch_dashboard(type, limit, offset, page, user_id) {
    const condition = type ? { type } : null;
    const resp = await database.payment.findAndCountAll({
      raw: true,
      where: condition,
      limit,
      offset,
      where: { user_id: user_id },
    });
    const response = getPagingData(resp, page, limit);
    let resp_ = response.data;
    const user = await database.users.findOne({
      raw: true,
      where: { user_id: user_id },
    });
    const paid = await database.paid.findOne({
      raw: true,
      where: { user_id: user_id },
    });
    var m_data = [];
    const today = new Date(new Date().toISOString().split("T")[0]);
    resp_.map((res) => {
      let c_date = res.due_date;
      let cdate = new Date(c_date);
      const current_age = get_age(user.user_dob);
      if (checkage < current_age) {
        res.amount = get_discount(discount_val, res.amount);
      }
      if (cdate < today) {
        res.amount = get_fine(fine_val, res.amount);
      }
      if (paid) {
        if (
          paid.paymentChittyId == res.paymentChittyId &&
          user.user_id == paid.user_id
        ) {
          return;
        }
      }
      m_data.push(res);
    });
    return m_data;
  }
}

export default UserService;

import database from '../models/index';

const getPagingData = (datas, page, limit) => {
  const { count: totalItems, rows: data } = datas;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    totalItems, data, totalPages, currentPage,
  };
};

class PaidService {
  static async create(postData) {
    const resp = await database.paid.create(postData)
      .then((data) => data)
      .catch((err) => err);
    return resp;
  }
  static async getUserId(userId) {
    const resp = await database.users.findOne({ where: { user_id: userId } });
    return resp;
  }
  static async getpayment(chitty_id) {
    const resp = await database.payment.findOne({ where: { paymentChittyId: chitty_id } });
    return resp;
  }
  static async getpaidinfo(userId,chitty_id) {
    const resp = await database.paid.findOne({ 
      where: { paymentChittyId: chitty_id,user_id:userId } });
    return resp;
  }
  static async remove(transaction_id) {
    await database.paid.destroy({
      where: { transaction_id: transaction_id },
    })
      .then((num) => {
        if (num === 1) {
          return true;
        }
        return false;
      }).catch(() => false);
  }



}

export default PaidService;

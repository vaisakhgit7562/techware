import database from '../models/index';
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Op = require('Sequelize').Op;
const HOURS = '12h';
const RS256 = 'RS256';

class AuthService {
  static async login(reqData) {
    const resp = await database.users.findAll({ where: reqData })
      .then((data) => data)
      .catch((err) => err);
    return resp;
  }

  static async token(data) {
    const payload = {
    userId: data.user_id,
    username: data.user_name,
    emailId: data.user_email
    };
    let userData;  
    userData = payload; 
    const privateKEY = fs.readFileSync('./private.key', 'utf8');
    const signOptions = {
      expiresIn: HOURS,
      algorithm: RS256,
    };
    const token = jwt.sign(payload, privateKEY, signOptions);
    const respData = {
      token      
    };
    return respData;
  }

  static async verify(bearerHeader) {
    try {
      if (bearerHeader.startsWith('Chitty ')) {
        const signOptions = {
          expiresIn: HOURS,
          algorithm: RS256,
        };

        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        const token = bearerToken;
        const publicKEY = fs.readFileSync('./public.key', 'utf8');
        const data = jwt.verify(token, publicKEY, signOptions);
        // console.log(data);
        return data;
      }
      return false;
    } catch (err) {
      return null;
    }
  }

  static async createUser(postData) {
    const resp = await database.users.create(postData)
      .then((data) => data)
      .catch((err) => err);
    return resp;
  }

  static async createProduct(postData) {
    const resps = await database.payment.create(postData)
      .then((data) => data)
      .catch((err) => err);
      const respss = await database.payment.findAndCountAll();
    return respss;
  }

  static async remove(userId) {
    await database.users.destroy({
      where: { user_id: userId },
    })
      .then((num) => {
        if (num === 1) {
          return true;
        }
        return false;
      }).catch(() => false);
  }

  static async check_exist(reqdata) {
    const resp = await database.users.findAndCountAll({ where: reqdata });
    return resp;
  }
  
  static async check_login(username,user_status) {
    const resp = await database.users.findOne({
      where: {
        user_status:user_status,
        [Op.or]: [{user_email: username}, {user_phone: username}]
      }
    });    
    return resp;
  }

  static async resetPassword(postData) {
    const resp = await database.users.update(postData, { where: { user_name: postData.emailId } });
    return resp;
  }
}

export default AuthService;

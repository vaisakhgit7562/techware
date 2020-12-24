import respObj from '../assets/lang/en.json';
import AuthService from '../services/auth.service';
import Response from '../utils/Response';
import Email from '../utils/Email';
import helpers from '../utils/helpers';
const sanitizer = require('sanitize')();
const bcrypt = require("bcryptjs");
const multer  = require('multer');
const fs  = require('fs');
const { authAPI,userAPI } = respObj;
const saltRounds = 10;

const response = new Response();
const em = new Email();
const refreshToken = process.env.AUTHTOKEN;
const STRING = 'str';
const REFERALAGENT = 'PASSWORD RESET';
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
      var dir = './uploads';
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }
      callback(null, dir);
  },
  filename: function (req, file, callback) {
    let datetimestamp = Date.now();
    callback(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])

     
  }
});
function isEmailValid(email) {
  const emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
  if (!email) return false;
  if (email.length > 254) return false;
  const valid = emailRegex.test(email);
  if (!valid) return false;
  const parts = email.split('@');
  if (parts[0].length > 64) return false;
  const domainParts = parts[1].split('.');
  if (domainParts.some((part) => part.length > 63)) return false;
  return true;
}
function isPhoneValid(phone) {
  const phoneNum = phone.replace(/[^\d]/g, '');
  if (phoneNum.length >= 8 && phoneNum.length <= 15) { return true; }
  return false;
}
  function formatDate(date) {
  let d = new Date(date),
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();

  if (month.length < 2) 
  month = '0' + month;
  if (day.length < 2) 
  day = '0' + day;

  return [year, month, day].join('-');
  }

exports.login = async (req, res) => {
  try {
    if (req.headers.refreshtoken !== refreshToken) {
      response.setError(process.env.STATUS_FORBIDDEN, authAPI.auth_failed);
      response.send(res);
    } else {
      if (!req.body.userName) {
        response.setError(process.env.STATUS_BAD_REQUEST, authAPI.invalid_username);
        response.send(res);
        return;
      }

      if (!req.body.userPassword) {
        response.setError(process.env.STATUS_BAD_REQUEST, authAPI.invalid_password);
        response.send(res);
        return;
      }
      const params = {
        username: sanitizer.value(req.body.userName, STRING),
        password: sanitizer.value(req.body.userPassword, STRING),
        status: 1,
      };         
      const auth = await AuthService.check_login(params.username,params.status);
      if (auth) {
      const password = bcrypt.compareSync(params.password,auth.user_password);
      if(password===false){
      response.setError(process.env.STATUS_ERROR, authAPI.auth_failed);
      response.send(res);
      return;
      }     
      }
      else {
      response.setError(process.env.STATUS_ERROR, authAPI.auth_failed);
      response.send(res);
      return;
      }  
      if (auth) {
        const token = await AuthService.token(auth);
        if (token) {
          response.setSuccess(process.env.STATUS_SUCCESS, authAPI.auth_success, token);
          response.send(res);
        }
      } else {
        response.setError(process.env.STATUS_ERROR, authAPI.auth_failed);
        response.send(res);
      }
    }
  } catch (err) {
    response.setError(process.env.STATUS_ERROR, authAPI.error_auth);
    response.send(res);
  }
};

exports.forgotPassword = async (req, res) => {
  if (!req.body.emailId) {
    response.setError(process.env.STATUS_BAD_REQUEST, authAPI.email_failed);
    response.send(res);
    return;
  }

  if (isEmailValid(req.body.emailId) === false) {
    response.setError(process.env.STATUS_BAD_REQUEST, authAPI.invalid_email);
    response.send(res);
    return;
  }

  const password = generator.generate({
    length: 10,
    numbers: true,
  });

  const emailCheck = await AuthService.checkEmail(req.body.emailId);
  if (emailCheck.count === 0) {
    response.setError(process.env.STATUS_BAD_REQUEST, authAPI.email_no_exists);
    response.send(res);
    return;
  }

  const params = {
    emailId: sanitizer.value(req.body.emailId, STRING),
  };

  const data = {
    emailId: params.emailId,
    password: md5(password),
  };

  if (emailCheck.count !== 0) {
    const fpRes = await AuthService.resetPassword(data);
    if (fpRes) {
      const subject = REFERALAGENT;
      const message = `Hi, <br/> The password for your account has been reset successfully. Please use below credentials for login. <br/> Username: ${params.emailId}<br/> New Password: ${password}<br/><br/>Thanks`;
      if (em.send(params.emailId, subject, message)) {
        response.setSuccess(process.env.STATUS_SUCCESS, authAPI.email_sent);
        response.send(res);
      } else {
        response.setSuccess(process.env.STATUS_ERROR, authAPI.email_not_sent);
        response.send(res);
      }
    } else {
      response.setSuccess(process.env.STATUS_SUCCESS, authAPI.email_not_sent);
      response.send(res);
    }
  }
};

exports.create = (req, res) => {
  try {
  if (req.headers.refreshtoken !== refreshToken) {
    response.setError(process.env.STATUS_FORBIDDEN, authAPI.auth_failed);
    response.send(res);
  } else {
    const userPhoto = multer({ storage: storage, fileFilter: helpers.imageFilter }).single('userPhoto');
    userPhoto(req, res,async function (err) {

    if (req.fileValidationError) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_file);
    response.send(res);
    return;
    }
    else if (!req.file) {
      response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_file);
      response.send(res);
      return;
    }
    else if (err instanceof multer.MulterError) {
      response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_file);
      response.send(res);
      return;
    }
    else if (err) {
      response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_file);
      response.send(res);
      return;
    }
    if (err) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_file);
    response.send(res);
    return;
    }

  // Validate request
  if (!req.body.userName) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_name);
    response.send(res);
    return;
  }

  if (!req.body.userEmail) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_email);
    response.send(res);
    return;
  }

  if (isEmailValid(req.body.userEmail) === false) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_email_type);
    response.send(res);
    return;
  }

  if (!req.body.userPhone) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_phone);
    response.send(res);
    return;
  }

  if (isPhoneValid(req.body.userPhone) === false) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_phone_type);
    response.send(res);
    return;
  }

  if (!req.body.userAddress) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_address);
    response.send(res);
    return;
  }
  if (!req.body.userDob) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_date);
    response.send(res);
    return;
  } 

const password = bcrypt.hashSync(req.body.userPassword,saltRounds);

const params = {
    username: sanitizer.value(req.body.userName, STRING),
    password: sanitizer.value(req.body.userPassword, STRING),
    emailId: sanitizer.value(req.body.userEmail, STRING),
    address: sanitizer.value(req.body.userAddress, STRING),
    dob: sanitizer.value(req.body.userDob, STRING),
    phone: sanitizer.value(req.body.userPhone, STRING),
    image: sanitizer.value(req.body.userPhoto, STRING),
  };

  // Create a User
  const user = {
    user_name: params.username,
    user_password: password,
    user_email: params.emailId,
    user_address: params.address,
    user_phone: params.phone,
    user_dob: formatDate(params.dob),
    user_image: params.image,
    user_status: 1,
  };
  const w_email= {
    user_email: user.user_email,
  };
  const w_phone= {
    user_phone: user.user_phone,
  };

  const PhoneCheck =  await AuthService.check_exist(w_phone);
  const emailCheck =  await AuthService.check_exist(w_email);
  if (PhoneCheck.count != 0) {
  response.setError(process.env.STATUS_BAD_REQUEST, userAPI.phone_exists);
  response.send(res);
  return;
  }
  
  if (emailCheck.count === 0) {
    const userData = await AuthService.createUser(user);
    //create token    
    const token =   await AuthService.token(userData);
    if (!token) { 
    response.setError(process.env.STATUS_ERROR, authAPI.auth_failed);
    response.send(res);
    }
      const users = {
      userId: userData.user_id,
      userName: userData.user_name,
      userEmail: userData.user_email,
      userPhone: userData.user_phone,
      token: token,
      };
    
      if (users) {
        const subject="Welcome to Chitty fund";
        const message = `You are account created successfully. <br/><br/>Thanks`;
        //email.send(users.userEmail, subject, message);
        response.setSuccess(process.env.STATUS_SUCCESS, userAPI.user_success,users);
        response.send(res);
      } else {
        AuthService.remove(usersId);
        response.setError(process.env.STATUS_ERROR, userAPI.user_failed);
        response.send(res);
      }
  
  } else {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.email_exists);
    response.send(res);
  }
});
}
} catch (err) {
  response.setError(process.env.STATUS_ERROR, authAPI.error_auth);
  response.send(res);
}

};

exports.addproduct = async (req, res) => {
 try {
  if (req.headers.refreshtoken !== refreshToken) {
    response.setError(process.env.STATUS_FORBIDDEN, authAPI.auth_failed);
    response.send(res);
  } else {
  // Validate request
  if (!req.body.chittyNo) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_Chitty);
    response.send(res);
    return;
  }

  if (!req.body.userId) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_user);
    response.send(res);
    return;
  }

  if (!req.body.amount) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_amount);
    response.send(res);
    return;
  }

  if (!req.body.issueDate) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_date);
    response.send(res);
    return;
  } 

  if (!req.body.dueDate) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_date);
    response.send(res);
    return;
  } 



const params = {
    chiityNo: sanitizer.value(req.body.chittyNo, STRING),
    userId: sanitizer.value(req.body.userId, STRING),
    amount: sanitizer.value(req.body.amount, STRING),
    issueDate: sanitizer.value(req.body.issueDate, STRING),
    dueDate: sanitizer.value(req.body.dueDate, STRING)  
  };

  // Create a Chitty
  const add_data = {
    chitty_no: params.chittyNo,
    user_id: params.userId,
    amount: params.amount,
    issue_date: formatDate(params.issueDate),
    due_date: formatDate(params.dueDate),  
  };
  const w_user= {
    user_id: add_data.user_id,
  }; 
    const userCheck =  await AuthService.check_exist(w_user);
    if (userCheck.count === 0) {
    response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_user);
    response.send(res);
    return;
    }  
    const AddData =  await AuthService.createProduct(add_data);
    //create chitty        
    if (AddData) {
    response.setSuccess(process.env.STATUS_SUCCESS, userAPI.success_,AddData);
    response.send(res);
    }    
}
} catch (err) {
  response.setError(process.env.STATUS_ERROR, authAPI.error_auth);
  response.send(res);
}

};
exports.verifyToken = async (req, res, next) => {
  const resp = await AuthService.verify(req.headers.authorization);
  if (resp) {
    req.body.loggedUser = resp;
    next();
  } else {
    res.sendStatus(403);
  }
};

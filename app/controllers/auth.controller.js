import respObj from "../assets/lang/en.json";
import AuthService from "../services/auth.service";
import Response from "../utils/Response";
import helpers from "../utils/helpers";

import * as EmailValidator from "email-validator";
const sanitizer = require("sanitize")();
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const { authAPI, userAPI } = respObj;
const saltRounds = 10;
const response = new Response();
const refreshToken = process.env.AUTHTOKEN;
const STRING = "str";
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    let dir = "./uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    callback(null, dir);
  },
  filename: function (req, file, callback) {
    let datetimestamp = Date.now();
    callback(
      null,
      file.fieldname +
        "-" +
        datetimestamp +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
    );
  },
});
function isPhoneValid(phone) {
  const phoneRe = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;
  if (phone.length >= 8 && phone.length <= 15 && phoneRe.test(phone) == true) {
    return true;
  }
  return false;
}
function isValidDate(dateString) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
}

exports.login = async (req, res) => {
  try {
    if (req.headers.refreshtoken !== refreshToken) {
      response.setError(process.env.STATUS_FORBIDDEN, authAPI.auth_failed);
      response.send(res);
    } else {
      if (!req.body.userName) {
        response.setError(
          process.env.STATUS_BAD_REQUEST,
          authAPI.invalid_username
        );
        response.send(res);
        return;
      }

      if (!req.body.userPassword) {
        response.setError(
          process.env.STATUS_BAD_REQUEST,
          authAPI.invalid_password
        );
        response.send(res);
        return;
      }
      const params = {
        username: sanitizer.value(req.body.userName, STRING),
        password: sanitizer.value(req.body.userPassword, STRING),
        status: 1,
      };
      const auth = await AuthService.check_login(
        params.username,
        params.status
      );
      if (auth) {
        const password = bcrypt.compareSync(
          params.password,
          auth.user_password
        );
        if (password === false) {
          response.setError(process.env.STATUS_ERROR, authAPI.auth_failed);
          response.send(res);
          return;
        }
      } else {
        response.setError(process.env.STATUS_ERROR, authAPI.auth_failed);
        response.send(res);
        return;
      }
      if (auth) {
        const token = await AuthService.token(auth);
        if (token) {
          response.setSuccess(
            process.env.STATUS_SUCCESS,
            authAPI.auth_success,
            token
          );
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
exports.create = (req, res) => {
  try {
    const contentType = req.get("content-type");
    if (contentType == "application/x-www-form-urlencoded") {
      response.setError(process.env.STATUS_BAD_REQUEST, authAPI.form_failed);
      response.send(res);
      return;
    }

    if (req.headers.refreshtoken !== refreshToken) {
      response.setError(process.env.STATUS_FORBIDDEN, authAPI.auth_failed);
      response.send(res);
    } else {
      const userPhoto = multer({
        storage: storage,
        fileFilter: helpers.imageFilter,
      }).single("userPhoto");
      userPhoto(req, res, async function (err) {
        if (req.fileValidationError) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.invalid_file
          );
          response.send(res);
          return;
        } else if (!req.file) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.invalid_file
          );
          response.send(res);
          return;
        } else if (err instanceof multer.MulterError) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.invalid_file
          );
          response.send(res);
          return;
        } else if (err) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.invalid_file
          );
          response.send(res);
          return;
        }
        if (err) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.invalid_file
          );
          response.send(res);
          return;
        }

        // Validate request
        if (!req.body.userName) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.invalid_name
          );
          response.send(res);
          return;
        }

        if (!req.body.userEmail) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.invalid_email
          );
          response.send(res);
          return;
        }
        if (EmailValidator.validate(req.body.userEmail) === false) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.invalid_email_type
          );
          response.send(res);
          return;
        }

        if (!req.body.userPhone) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.invalid_phone
          );
          response.send(res);
          return;
        }

        if (isPhoneValid(req.body.userPhone) === false) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.invalid_phone_type
          );
          response.send(res);
          return;
        }

        if (!req.body.userAddress) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.invalid_address
          );
          response.send(res);
          return;
        }
        if (isValidDate(req.body.userDob) === false) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.invalid_date
          );
          response.send(res);
          return;
        }
        const password = bcrypt.hashSync(req.body.userPassword, saltRounds);
        const params = {
          username: sanitizer.value(req.body.userName, STRING),
          password: sanitizer.value(req.body.userPassword, STRING),
          emailId: sanitizer.value(req.body.userEmail, STRING),
          address: sanitizer.value(req.body.userAddress, STRING),
          dob: sanitizer.value(req.body.userDob, STRING),
          phone: sanitizer.value(req.body.userPhone, STRING),
          image: sanitizer.value(req.file.filename, STRING),
        };

        // Create a User
        const user = {
          user_name: params.username,
          user_password: password,
          user_email: params.emailId,
          user_address: params.address,
          user_phone: params.phone,
          user_dob: params.dob,
          user_image:
            req.protocol +
            "://" +
            req.headers.host +
            "/uploads/" +
            params.image,
          user_status: 1,
        };
        const w_email = {
          user_email: user.user_email,
        };
        const w_phone = {
          user_phone: user.user_phone,
        };

        const PhoneCheck = await AuthService.check_exist(w_phone);
        const emailCheck = await AuthService.check_exist(w_email);
        if (PhoneCheck.count != 0) {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.phone_exists
          );
          response.send(res);
          return;
        }

        if (emailCheck.count === 0) {
          const userData = await AuthService.createUser(user);
          //create token
          const token = await AuthService.token(userData);
          if (!token) {
            response.setError(process.env.STATUS_ERROR, authAPI.auth_failed);
            response.send(res);
          }
          const users = {
            userId: userData.user_id,
            userName: userData.user_name,
            userEmail: userData.user_email,
            userPhone: userData.user_phone,
            userPhoto: userData.user_image,
            token: token,
          };

          if (users) {
            response.setSuccess(
              process.env.STATUS_SUCCESS,
              userAPI.user_success,
              users
            );
            response.send(res);
          } else {
            AuthService.remove(users.usersId);
            response.setError(process.env.STATUS_ERROR, userAPI.user_failed);
            response.send(res);
          }
        } else {
          response.setError(
            process.env.STATUS_BAD_REQUEST,
            userAPI.email_exists
          );
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
        response.setError(
          process.env.STATUS_BAD_REQUEST,
          userAPI.invalid_Chitty
        );
        response.send(res);
        return;
      }

      if (!req.body.userId) {
        response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_user);
        response.send(res);
        return;
      }

      if (isNaN(req.body.amount) || !req.body.amount) {
        response.setError(
          process.env.STATUS_BAD_REQUEST,
          userAPI.invalid_amount
        );
        response.send(res);
        return;
      }

      if (isValidDate(req.body.issueDate) === false) {
        response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_date);
        response.send(res);
        return;
      }

      if (isValidDate(req.body.dueDate) === false) {
        response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_date);
        response.send(res);
        return;
      }

      const params = {
        chiityNo: sanitizer.value(req.body.chittyNo, STRING),
        userId: sanitizer.value(req.body.userId, STRING),
        amount: sanitizer.value(req.body.amount, STRING),
        issueDate: sanitizer.value(req.body.issueDate, STRING),
        dueDate: sanitizer.value(req.body.dueDate, STRING),
      };

      // Create a Chitty
      const add_data = {
        chitty_no: params.chittyNo,
        user_id: params.userId,
        amount: params.amount,
        issue_date: params.issueDate,
        due_date: params.dueDate,
      };
      const w_user = {
        user_id: add_data.user_id,
      };
      const userCheck = await AuthService.check_exist(w_user);
      if (userCheck.count === 0) {
        response.setError(process.env.STATUS_BAD_REQUEST, userAPI.invalid_user);
        response.send(res);
        return;
      }
      const AddData = await AuthService.createProduct(add_data);
      if (AddData) {
        response.setSuccess(
          process.env.STATUS_SUCCESS,
          userAPI.success_,
          AddData
        );
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

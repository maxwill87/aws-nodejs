var userUtil = require('./userUtils');
var passwordHash = require('password-hash');
var userController = {};
const _ = require('lodash');
var userData;

userController.addDetail = (req, res) => {
  const { userEmail, userPassword, userpicture, userName, userGender, seasons } = req.body;
  userData = {
    userEmail: userEmail,
    userPassword: passwordHash.generate(userPassword),
    userName: userName,
    userGender: userGender,
    seasons: seasons,
  };
  userpicture ? userData.userpicture = userpicture : null;

  userUtil.createUser(userData).then((data) => {
    res.status(200).json({ body: "Your registration is done successfully.", data: data });
  }).catch(() => {
    res.status(400).json({ error: "sorry, error in operation." })
  })

}

userController.getDetail = (req, res) => {
  const userId = req.query.id;

  userUtil.getUser(userId).then((data) => {
    res.status(200).json({ body: data });
  }).catch(() => {
    res.status(400).json({ error: "sorry, error in operation." })
  })
}

userController.varifyUser = (req, res) => {

  const { userEmail, userPassword } = req.body;
  const userData = {
    userEmail: userEmail,
    userPassword: userPassword
  }

  userUtil.varifyUser(userData).then((data) => {
    (passwordHash.verify(userData.userPassword, data.userPassword)) ? res.status(200).json({ body: "You're login successfully.", data: data }) : res.status(400).json({ error: "Sorry, you entered wrong password." })
  }).catch((err) => {
    res.status(400).json({ error: "Sorry, error in operation." })
  })
}

userController.editUserDetail = (req, res) => {
  const { seasons, userGender, userName, userpicture } = req.body;
  let userData = {
    seasons: seasons,
    userGender: userGender,
    userName: userName,
  }
  userpicture ? userData.userpicture = userpicture : null;
  userUtil.editUser(req.body.id, userData).then((resp) => {
    res.status(200).json({ body: "Your details has been edited.", data: resp });
  }).catch(() => {
    res.status(400).json({ error: "sorry, error in operation." })
  })
}

userController.checkUserExist = (req, res) => {
  userUtil.checkUserExist(req.body.email).then((data) => {
    if (!_.isEmpty(data)) {
      res.status(200).json({ isexist: true });
    } else {
      res.status(200).json({ isexist: false });
    }
  }).catch((err) => {
    res.status(400).json({ error: "Sorry, error in operation." })
  })
}

userController.forgotPasswordHandler = (req, res) => {
  const { userEmail, userMobile } = req.body;
  if (userEmail) {
    userUtil.forgotPasswordUSerEmail(userEmail).then((data) => {
      res.status(200).json({ body: "your password has been sent to you. Please check your email.", data: data });
    }).catch((err) => {
      res.status(400).json({ error: err.message })
    });
  }
  else if (userMobile) {
    userUtil.forgotPasswordUSerMobile(userMobile).then((data) => {
      res.status(200).json({ body: "your password has been sent to you. Please check your messages.", data: data })
    }).catch((err) => {
      res.status(400).json({ error: err.message })
    });
  }
}

module.exports = userController;
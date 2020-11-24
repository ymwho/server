let { User } = require('../model/User');

let Auth = (req, res, next) => {
  let token = req.cookies.auth;

  User.findToken(token, (err, user) => {
    if (err) {
      return res.json({ message: ' not found user token' });
    }
    if (!user) {
      return res.json({ message: ' not found user token22' });
    }

    req.user = user;
    req.token = token;
    next();
  });
};

module.exports = { Auth };

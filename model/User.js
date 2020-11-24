let mongoose = require('mongoose');
let { Schema } = mongoose;
let bcrypt = require('bcrypt');
let saltRounds = 10;
let jwt = require('jsonwebtoken');

let userSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
    },
    name: {
      type: String,
    },

    token: {
      type: String,
    },
    role: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', function (next) {
  let user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) {
        return next(err);
      }

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (loginPassword, cf) {
  let user = this;

  bcrypt.compare(loginPassword, user.password, function (err, match) {
    if (err) {
      return cf(err);
    }

    cf(null, match);
  });
};

userSchema.methods.generateToken = function (cf) {
  let user = this;

  let token = jwt.sign(user._id.toHexString(), 'scretKey');

  user.token = token;
  user.save(function (err, users) {
    if (err) {
      return cf(err);
    }
    cf(null, users);
  });
};

userSchema.statics.findToken = function (token, cf) {
  let user = this;
  jwt.verify(token, 'scretKey', function (err, decoded) {
    if (err) {
      return cf(err);
    }

    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) {
        return cf(err);
      }
      cf(null, user);
    });
  });
};

let User = (module.exports = mongoose.model('User', userSchema));

module.exports = { User };

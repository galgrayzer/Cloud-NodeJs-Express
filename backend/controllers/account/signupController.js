const User = require("../../modules/user");
const { validationResult, body } = require("express-validator");
const bcrypt = require("bcryptjs");

exports.getSignup = (req, res, next) => {
  res.render("./account/signup", {
    document: "Signup",
    signup: true,
    account: true,
  });
};

exports.postSignup = (req, res, next) => {
  const body = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("./account/signup", {
      document: "Signup",
      signup: true,
      account: true,
      message: errors.array()[0].msg,
      username: body.username,
      email: body.email,
      password: body.password,
    });
  }
  User.findOne({ email: body.email })
    .then((user) => {
      if (user) {
        return res.render("./account/signup", {
          document: "Signup",
          signup: true,
          account: true,
          userError: true,
          message: "Email allready in use",
          username: body.username,
          email: body.email,
          password: body.password,
        });
      }
      return bcrypt.hash(body.password, 12).then((hashPassword) => {
        new User({
          username: body.username,
          password: hashPassword,
          email: body.email,
          files: [],
        })
          .save()
          .then((result) => {
            req.session.isLoggedIn = true;
            return User.findOne({ email: body.email }).then((user) => {
              req.session.user = user;
              req.session.save((err) => {
                if (err) {
                  console.log(err);
                }
              });
            });
          })
          .then((result) => {
            return res.redirect("/");
          })
          .catch((err) => console.log(err));
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postGoogle = (req, res, next) => {
  const body = req.body;
  User.findOne({ email: body.email }).then((user) => {
    if (user) {
      return res.render("./account/signup", {
        document: "Signup",
        signup: true,
        account: true,
        userError: true,
        message: "Email allready in use",
        email: body.email,
      });
    }
    username = body.username.replace(" ", "_");
    new User({
      username: username.Length > 20 ? username.slice(0, 19) : username,
      sub: body.sub,
      email: body.email,
      files: [],
    })
      .save()
      .then((result) => {
        req.session.isLoggedIn = true;
        return User.findOne({ email: body.email }).then((user) => {
          req.session.user = user;
          req.session.save((err) => {
            if (err) {
              console.log(err);
            }
          });
        });
      })
      .then((result) => {
        return res.redirect("/");
      })
      .catch((err) => console.log(err));
  });
};

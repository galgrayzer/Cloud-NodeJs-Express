const User = require("../../modules/user");
const { validationResult } = require("express-validator");
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
      message: errors.array({ onlyFirstError: true })[0].msg,
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
            // sendEmail({
            //   email: body.email,
            //   username: body.username,
            //   subject: "New Cloud Account",
            //   html: `<h1>Welcome! ${body.username}</h1>`,
            // });
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

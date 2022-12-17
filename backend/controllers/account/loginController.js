const User = require("../../modules/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("./account/login", {
    document: "Login",
    login: true,
    account: true,
  });
};

exports.postLogin = (req, res, next) => {
  const body = req.body;
  User.findOne({ email: body.email })
    .then((user) => {
      if (!user) {
        if (body.sub) {
          return res.render("./account/login", {
            document: "Login",
            login: true,
            account: true,
            googleError: true,
            email: body.email,
          });
        }
        return res.render("./account/login", {
          document: "Login",
          login: true,
          account: true,
          userError: true,
          email: body.email,
        });
      } else if (body.sub && user.sub) {
        if (user.sub !== body.sub) {
          console.log("s");
          return res.render("./account/login", {
            document: "Login",
            login: true,
            account: true,
            googleError: true,
            email: body.email,
          });
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save((err) => {
          if (err) {
            console.log(err);
          }
          res.redirect("/");
        });
      } else {
        return bcrypt
          .compare(body.password, user.password)
          .then((doMatch) => {
            if (!doMatch) {
              return res.render("./account/login", {
                document: "Login",
                login: true,
                account: true,
                userError: true,
                email: body.email,
              });
            }
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save((err) => {
              if (err) {
                console.log(err);
              }
              res.redirect("/");
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

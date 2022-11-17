const User = require("../../modules/user");
const sendEmail = require("../../utils/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

exports.getReset = (req, res, next) => {
  res.render("./account/reset", {
    document: "Reset Password",
    account: true,
    reset: true,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset-password");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res.render("./account/reset", {
            document: "Reset Password",
            account: true,
            reset: true,
            userError: true,
          });
        }
        user.resetToken = token;
        user.resetTokenTime = Date.now() + 1800000;
        return user.save();
      })
      .then((result) => {
        if (!result) {
          return result;
        }
        res.render("./account/reset", {
          document: "Reset Password",
          account: true,
          reset: true,
          emailSent: true,
        });
        fs.readFile(
          path.join(
            __dirname,
            "../../..",
            "frontend",
            "emails",
            "reset-email.html"
          ),
          (err, data) => {
            if (err) {
              console.log(err);
            }
            sendEmail({
              email: req.body.email,
              username: "username",
              subject: "Password Reset",
              html: data
                .toString()
                .replace(
                  "XX",
                  `${process.env.PUBLIC_URL}reset-password/${token}`
                ),
            });
          }
        );
      })
      .catch((err) => {
        console.log(err);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getUpdateP = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenTime: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(404).render("404", {
          document: "Page not found",
        });
      }
      res.render("./account/update-password", {
        document: "Change Password",
        account: true,
        userId: user.id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postUpdateP = (req, res, next) => {
  User.findOne({
    passwordToken: req.body.resetToken,
    resetTokenTime: { $gt: Date.now() },
    _id: req.body.userId,
  })
    .then((user) => {
      if (!user) {
        return res.status(404).render("404", {
          document: "Page not found",
        });
      } else if (req.body.password !== req.body.passwordConfirm) {
        return res.render("./account/update-password", {
          document: "Change Password",
          account: true,
          userId: user.id.toString(),
          passwordToken: req.body.token,
          message: "Passwords are not the same",
        });
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render("./account/update-password", {
          document: "Change Password",
          account: true,
          userId: user.id.toString(),
          password: req.body.password,
          passwordConfirm: req.body.passwordConfirm,
          passwordToken: req.body.token,
          message: errors.array({ onlyFirstError: true })[0].msg,
        });
      }
      return bcrypt
        .hash(req.body.password, 12)
        .then((hashedPassword) => {
          user.password = hashedPassword;
          user.resetToken = undefined;
          user.resetTokenTime = undefined;
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

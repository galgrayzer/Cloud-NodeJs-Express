const User = require("../../modules/user");
const File = require("../../modules/file");

const { validationResult } = require("express-validator");
const fs = require("fs");

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};

exports.getAccount = (req, res, next) => {
  res.render("./account/account", {
    document: "Update Account",
    account: true,
    editAccount: true,
    userAuth: true,
  });
};

exports.postAccount = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("./account/account", {
      document: "Update Account",
      account: true,
      editAccount: true,
      userAuth: true,
      message: errors.array({ onlyFirstError: true })[0].msg,
    });
  }
  User.findOne({ _id: req.session.user._id })
    .then((user) => {
      if (!user) {
        console.log("User not found error");
        return res.redirect("/");
      }
      return User.findOne({ email: req.body.email })
        .then((emailUser) => {
          if (emailUser) {
            if (emailUser.email === user.email) {
              user.username = req.body.username;
              user.save();
              req.session.user = user;
              return true;
            }
            return false;
          }
          user.username = req.body.username;
          user.email = req.body.email;
          user.save();
          req.session.user = user;
          return true;
        })
        .then((result) => {
          if (result) {
            return res.redirect("/account");
          }
          return res.render("./account/account", {
            document: "Update Account",
            account: true,
            editAccount: true,
            userAuth: true,
            userError: true,
            message: "Email allrady in use!",
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getDelete = (req, res, next) => {
  res.render("./account/delete-account", {
    document: "Delete Account",
    account: true,
    deleteAccount: true,
    editAccount: true,
  });
};

exports.postDelete = (req, res, next) => {
  if (req.body.username !== req.body.userValidName) {
    return res.redirect("/delete-account");
  }
  User.deleteOne({ _id: req.session.user._id })
    .then((result) => {
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
        }
        res.redirect("/");
        File.find({ owner: req.body.id })
          .lean()
          .then((files) => {
            File.deleteMany({ owner: req.body.id })
              .then((result) => {
                files.forEach((file) => {
                  fs.unlink(file.path, (err) => {
                    if (err) {
                      console.log(err);
                    }
                  });
                });
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

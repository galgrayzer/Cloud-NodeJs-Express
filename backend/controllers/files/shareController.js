const File = require("../../modules/file");
const User = require("../../modules/user");
const sendEmail = require("../../utils/sendEmail");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

exports.getShare = (req, res, next) => {
  File.findById(req.params.fileId)
    .lean()
    .then((file) => {
      if (!file) {
        console.log("file not found");
        return res.redirect("/files");
      }
      if (req.query.userId !== req.session.user._id.toString()) {
        console.log("User accsses denied!");
        return res.status(404).render("404", {
          document: "Page not found",
        });
      }
      res.render("./files/share", {
        document: "Share File",
        files: true,
        share: true,
        file: file,
        fileName:
          file.name.length < 16 ? file.name : file.name.slice(0, 15) + "...",
      });
    })
    .catch((err) => console.log(err));
};

exports.postShare = (req, res, next) => {
  const fileId = req.params.fileId;
  File.findById(fileId)
    .then((file) => {
      if (!file) {
        console.log("file not found");
        return res.redirect("/files");
      }
      User.findOne({ email: req.body.email })
        .then((user) => {
          if (!user) {
            return res.render("./files/share", {
              document: "Share File",
              files: true,
              share: true,
              file: file.toObject(),
              fileName:
                file.name.length < 16
                  ? file.name
                  : file.name.slice(0, 15) + "...",
              userError: true,
            });
          }
          if (file.owner.toString() !== req.session.user._id.toString()) {
            console.log("acsses denied!");
            return res.redirect("/files");
          }
          crypto.randomBytes(32, (err, buffer) => {
            const token = buffer.toString("hex");
            file.shraeToken = token;
            file.shareTokenExp = Date.now() + 600000;
            file.save();
            fs.readFile(
              path.join(
                __dirname,
                "../../..",
                "frontend",
                "emails",
                "sharing-email.html"
              ),
              (err, data) => {
                if (err) {
                  console.log(err);
                }
                sendEmail({
                  email: user.email,
                  username: user.username,
                  subject: `${req.session.user.username} shared a file with you!`,
                  html: data
                    .toString()
                    .replace(
                      "XX",
                      `${process.env.PUBLIC_URL}get-share/${token}`
                    ),
                });
              }
            );
            res.render("./files/share", {
              document: "Share File",
              files: true,
              share: true,
              file: file.toObject(),
              fileName:
                file.name.length < 16
                  ? file.name
                  : file.name.slice(0, 15) + "...",
              shared: true,
            });
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getGetShare = (req, res, next) => {
  const token = req.params.token;
  File.findOne({ shraeToken: token, shareTokenExp: { $gt: Date.now() } })
    .then((file) => {
      if (!file) {
        return res.render("404", {
          document: "Page not found",
        });
      }
      file.shraeToken = undefined;
      file.shareTokenExp = undefined;
      file.save();
      res.render("./files/get-file", {
        document: "Get file",
        file: file.toObject(),
      });
    })
    .catch((err) => console.log(err));
};

exports.postGetShare = (req, res, next) => {
  if (req.body.button === "no") {
    return res.redirect("/");
  }
  File.findById(req.body.fileId)
    .lean()
    .then((file) => {
      if (!file) {
        return res.render("./files/get-file", {
          document: "Get file",
          file: file.toObject(),
          fileError: true,
        });
      }
      fs.readFile(file.path, (err, data) => {
        if (err) {
          console.log(err);
          return res.redirect("/files");
        }
        const filePath = path.join(
          __dirname,
          "../..",
          "data",
          new Date().toISOString().replace(/:/g, "_") + "&" + file.name
        );
        fs.writeFile(filePath, data, (err) => {
          (err) => {
            if (err) {
              console.log(err);
            }
          };
        });
        return new File({
          name: file.name,
          size: file.size,
          path: filePath,
          image: file.image,
          owner: req.session.user._id,
        })
          .save()
          .then((newFile) => {
            return User.findById(req.session.user._id).then((user) => {
              user.files = [...user.files, { fileId: newFile._id }];
              user.save();
              req.session.user = user;
              req.session.save();
              res.redirect("/files");
            });
          });
      });
    })
    .catch((err) => console.log(err));
};

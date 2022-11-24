const User = require("../../modules/user");
const File = require("../../modules/file");
const fs = require("fs");
const crypto = require("crypto");
const encrypt = require("../../utils/encryption");

const sizeC = (size) => {
  if (size < 1000) {
    return size.toString() + "B";
  } else if (size < 1000 ** 2) {
    return (size / 1000).toFixed(1).toString() + "KB";
  } else if (size < 1000 ** 3) {
    return (size / 1000 ** 2).toFixed(1).toString() + "MB";
  } else {
    return (size / 1000 ** 3).toFixed(1).toString() + "GB";
  }
};

const imageExt = [
  "avi",
  "css",
  "dll",
  "doc",
  "eps",
  "html",
  "jpg",
  "mov",
  "mp3",
  "pdf",
  "png",
  "ppt",
  "psd",
  "txt",
  "wav",
  "xls",
  "zip",
];

exports.getFiles = (req, res, next) => {
  let userFiles = [];
  User.findById(req.session.user._id)
    .then((user) => {
      if (user.files.length === 0) {
        return res.render("./files/files", {
          document: "Files",
          files: true,
          userFiles: userFiles,
        });
      }
      const promises = [];
      for (let index = 0; index < user.files.length; index++) {
        const fileId = user.files[index];
        promises.push(
          File.findById(fileId.fileId)
            .lean()
            .then((file) => {
              if (!file) {
                console.log("file not found!");
              }
              userFiles.push(file);
            })
        );
      }
      Promise.all(promises)
        .then((results) => {
          return res.render("./files/files", {
            document: "Files",
            files: true,
            userFiles: userFiles,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postAddFile = (req, res, next) => {
  const file = req.file;
  const ext = file.originalname.split(".")[1].toLowerCase();
  new File({
    name: file.originalname,
    size: sizeC(file.size),
    creationDate: file.filename.split("T", 1)[0],
    path: file.path,
    image: imageExt.includes(ext) ? ext + ".png" : "unknown.png",
    owner: req.session.user._id,
  })
    .save()
    .then((result) => {
      return User.findById(req.session.user._id)
        .then((user) => {
          user.files = [...user.files, { fileId: result._id }];
          return user
            .save()
            .then((result) => {
              req.session.user = result;
              return req.session.save((err) => {
                if (err) {
                  console.log(err);
                }
                return res.redirect("/files");
              });
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postDeleteFile = (req, res, next) => {
  const fileId = req.params.fileId;
  const userId = req.body.userId;
  File.findById(fileId)
    .then((file) => {
      if (file.owner.toString() !== userId) {
        return res.redirect("/files");
      }
      file
        .delete()
        .then((result) => {
          User.findById(userId)
            .then((user) => {
              if (!user) {
                console.log("user not found");
                return res.redirect("/files");
              }
              const files = [...user.files];
              let index;
              for (index = 0; index < files.length; index++) {
                const file = files[index];
                if (file.fileId.toString() === result._id.toString()) {
                  break;
                }
              }
              files.splice(index, 1);
              user.files = files;
              user.save().then((userSaved) => {
                req.session.user = user;
                req.session.save((err) => {
                  if (err) {
                    console.log(err);
                  }
                  fs.unlink(result.path, (err) => {
                    if (err) {
                      console.log(err);
                    }
                    return res.redirect("/files");
                  });
                });
              });
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getDownload = (req, res, next) => {
  const fileId = req.params.fileId;
  File.findById(fileId)
    .then((file) => {
      if (!file) {
        console.log("file not found!");
        return res.redirect("/files");
      }
      if (file.owner.toString() !== req.session.user._id.toString()) {
        return res.status(404).render("404", {
          document: "Page not found",
        });
      }
      const fileData = fs.createReadStream(file.path); // Read stream of file
      res.setHeader(
        "Content-Type",
        "application/" + file.name.split(".", 1)[1]
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename*=UTF-8''" + encodeURIComponent(file.name)
      );
      fileData.pipe(res); // Streams the file
    })
    .catch((err) => console.log(err));
};

exports.postLock = (req, res, next) => {
  File.findById(req.params.fileId)
    .then((file) => {
      if (!file) {
        console.log("file not found");
        return res.redirect("/files");
      }
      if (file.owner.toString() !== req.session.user._id.toString()) {
        console.log("acsses denied");
        return res.redirect("/files");
      }
      if (!file.key) {
        const key = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        file.key = key;
        file.save();
        encrypt.encrypt(file.path, key, iv);
        return res.redirect("/files");
      } else {
        encrypt.decrypt(file.path, file.key);
        file.key = undefined;
        file.save();
        return res.redirect("/files");
      }
    })
    .catch((err) => console.log(err));
};

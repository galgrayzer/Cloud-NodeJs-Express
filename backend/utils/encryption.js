var fs = require("fs");
var crypto = require("crypto");

exports.encrypt = (path, key, iv) => {
  fs.readFile(path, (err, buffer) => {
    if (err) {
      return console.log(err);
    }
    const cipher = crypto.createDecipheriv("aes-256-ctr", key, iv);
    const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    fs.writeFile(path, result, (err, data) => {
      if (err) {
        return console.log(err);
      }
      if (!data) {
        return console.log("data not found");
      }
    });
  });
};
exports.de
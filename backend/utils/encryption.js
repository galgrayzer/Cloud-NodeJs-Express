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
    });
  });
};

exports.decrypt = (path, key) => {
  fs.readFile(path, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const iv = buffer.slice(0, 16);
    buffer = buffer.slice(16);
    const decipher = crypto.createDecipheriv("aes-256-ctr", key, iv);
    const result = Buffer.concat([decipher.update(buffer), decipher.final()]);
    fs.writeFile(path, result, (err, data) => {
      if (err) {
        console.log(err);
      }
    });
  });
};

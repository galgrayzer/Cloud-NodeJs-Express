var fs = require("fs");
var crypto = require("crypto");

exports.encrypt = (path, key, iv) => {
  var cipher = crypto.createCipheriv("aes-256", key, iv);
  var input = fs.createReadStream(path);
  var output = fs.createWriteStream(path);

  input.pipe(cipher).pipe(output);

  output.on("finish", function () {
    console.log("Encrypted file written to disk!");
  });
};

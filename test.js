const { encryptFile, decryptFile } = require("file-encryptor");
const crypto = require("crypto");

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
encryptFile(
  "test.txt",
  "testa.txt",
  key,
  iv,
  { algorithm: "aes256" },
  (err) => {
    if (err) {
      console.log(err);
    }
    console.log("done");
  }
);

decryptFile(
  "testa.txt",
  "testd.txt",
  key,
  iv,
  { algorithm: "aes256" },
  (err) => {
    if (err) {
      console.log(err);
    }
    console.log("done");
  }
);

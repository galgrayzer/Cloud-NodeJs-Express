const Mailjet = require("node-mailjet");
const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE,
});

module.exports = ({
  email: email,
  username: username,
  subject: subject,
  html: html,
}) => {
  mailjet
    .post("send", { version: "v3.1" })
    .request({
      Messages: [
        {
          From: {
            Email: "galscloud@gmail.com",
            Name: "Cloud",
          },
          To: [
            {
              Email: email,
              Name: username,
            },
          ],
          Subject: subject,
          TextPart: "Cloud",
          HTMLPart: html,
        },
      ],
    })
    .catch((err) => {
      console.log(err);
    });
};

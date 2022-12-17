const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: false,
    },
    resetToken: String,
    resetTokenTime: Date,
    email: {
      type: String,
      require: true,
    },
    sub: {
      type: String,
      require: false,
    },
    files: [
      {
        fileId: {
          type: Schema.Types.ObjectId,
          require: true,
          ref: "File",
        },
      },
    ],
  },
  { versionKey: false }
);

module.exports = model("User", userSchema);

const { model, Schema, default: mongoose } = require("mongoose");

const fileSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    size: {
      type: String,
      require: true,
    },
    creationDate: {
      type: String,
      require: true,
    },
    path: {
      type: String,
      require: true,
    },
    image: {
      type: String,
      require: true,
    },
    shraeToken: {
      type: String,
      require: false,
    },
    shareTokenExp: {
      type: Date,
      require: false,
    },
    key: {
      type: Buffer,
      require: false,
    },
    iv: {
      type: Buffer,
      require: false,
    },
    owner: {
      type: mongoose.Types.ObjectId,
      require: true,
      ref: "User",
    },
  },
  { versionKey: false }
);

module.exports = model("File", fileSchema);

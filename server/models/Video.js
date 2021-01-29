const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const videoSchema = Schema(
  {
    writer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      maxlength: 50,
    },
    description: String,
    category: String,
    private: Number,
    filePath: String,
    duration: Number,
    thumbnail: String,
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Video = mongoose.model("Video", videoSchema);

module.exports = { Video };

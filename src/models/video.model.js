import mongoose, {Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchemas = new Schema(
  {
    videoFile: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: boolean,
      default: true,
    },
    owner: {
      type: Schema.types.ObjectId,
      ref: "User",
    },
  },
  {timestamps: true}
);

videoSchemas.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchemas);

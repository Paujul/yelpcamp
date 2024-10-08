const mongoose = require("mongoose")
const Review = require("./review")
const Schema = mongoose.Schema

const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review", // Review model
    },
  ],
})

// <schema>.post(delete) = Post delete mo ngapain?
CampgroundSchema.post("findOneAndDelete", async function (campground) {
  if (campground) {
    await Review.deleteMany({
      _id: {
        $in: campground.reviews,
      },
    })
  }
})

module.exports = mongoose.model("Campground", CampgroundSchema)

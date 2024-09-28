const express = require("express")
const router = express.Router({ mergeParams: true }) // Biar dpt param id

const { ReviewSchema } = require("../schemas.js")

const Campground = require("../models/campground")
const Review = require("../models/review.js")

const catchAsync = require("../utils/catchAsync")

const validateReview = (req, res, next) => {
  const { error } = ReviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((e) => e.message).join(",")
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res) => {
    console.log(req.params, req.body)
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash("success", "Thanks for your review!")
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    })
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "Successfully deleted a review!")
    res.redirect(`/campgrounds/${id}`)
  })
)

module.exports = router

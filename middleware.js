const { CampgroundSchema, ReviewSchema } = require("./schemas")
const Campground = require("./models/campground")
const Review = require("./models/review")

const ExpressError = require("./utils/ExpressError")

// ID checker for error validation
const ObjectID = require("mongoose").Types.ObjectId

module.exports.isLoggedIn = (req, res, next) => {
  req.session.returnTo = req.originalUrl
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in to do that.")
    return res.redirect("/login")
  }
  next()
}

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo
  }
  next()
}

module.exports.validateCampground = (req, res, next) => {
  const { error } = CampgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((e) => e.message).join(",")
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

module.exports.validateReview = (req, res, next) => {
  const { error } = ReviewSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((e) => e.message).join(",")
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You don't have the permission to do that!")
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params
  const review = await Review.findById(reviewId)
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have the permission to do that!")
    return res.redirect(`/campgrounds/${id}`)
  }
  next()
}

module.exports.isValid = (req, res, next) => {
  const { id } = req.params
  if (!ObjectID.isValid(id)) {
    throw new ExpressError("Invalid campground ID", 400)
  }
  next()
}

const express = require("express")
const router = express.Router()

const { campgroundSchema } = require("../schemas")
const Campground = require("../models/campground")

const catchAsync = require("../utils/catchAsync")
const ExpressError = require("../utils/ExpressError")
const { isLoggedIn } = require("../middleware")

// ID checker for error validation
const ObjectID = require("mongoose").Types.ObjectId

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((e) => e.message).join(",")
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

const verifyPassword = (req, res, next) => {
  const { password } = req.query
  if (password === "nuggets") {
    next()
  }
  throw new ExpressError("Password required!!!", 401)
}

//  Routes  //
router.get("/", async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render("campgrounds/index", { campgrounds })
})

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new")
})

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params

    if (!ObjectID.isValid(id)) {
      throw new ExpressError("Invalid campground ID", 400)
    }

    const campground = await Campground.findById(id).populate("reviews")

    if (!campground) {
      req.flash("error", "Campground not found!")
      return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground })
  })
)

router.get(
  "/:id/edit",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params
    if (!ObjectID.isValid(id)) {
      throw new ExpressError("Invalid campground ID", 400)
    }

    const campground = await Campground.findById(id)

    if (!campground) {
      req.flash("error", "Campground not found!")
      return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { campground, id })
  })
)

router.get("/secret", verifyPassword, (req, res) => {
  res.send("My secret!!")
})

//      Post        //

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    req.flash("success", "Successfully made a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

//      Put     //

router.put(
  "/:id",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(
      id,
      req.body.campground,
      {
        runValidators: true,
        new: true,
      }
    )
    req.flash("success", "Campground updated!")
    res.redirect(`/campgrounds/${id}`)
  })
)

//      Delete      //

router.delete(
  "/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash("success", "Successfully deleted a campground!")
    res.redirect("/campgrounds")
  })
)

module.exports = router

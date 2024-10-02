const express = require("express")
const router = express.Router()

const Campground = require("../models/campground")

const catchAsync = require("../utils/catchAsync")
const {
  isLoggedIn,
  validateCampground,
  isAuthor,
  isValid,
} = require("../middleware")

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
  isValid,
  catchAsync(async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("author")

    // console.log(campground.reviews[0].author)

    if (!campground) {
      req.flash("error", "Campground not found!")
      return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground })
  })
)

router.get(
  "/:id/edit",
  isValid,
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)

    if (!campground) {
      req.flash("error", "Campground not found!")
      return res.redirect("/campgrounds")
    }

    res.render("campgrounds/edit", { campground, id })
  })
)

//      Post        //

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    campground.author = req.user._id

    await campground.save()
    req.flash("success", "Successfully made a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

//      Put     //

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params
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
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash("success", "Successfully deleted a campground!")
    res.redirect("/campgrounds")
  })
)

module.exports = router

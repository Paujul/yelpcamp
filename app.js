const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")

const { campgroundSchema, reviewSchema } = require("./schemas.js")

const ExpressError = require("./utils/ExpressError")
const catchAsync = require("./utils/catchAsync")
const Campground = require("./models/campground")
const Review = require("./models/review.js")

// Boilerplate //
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp")

const db = mongoose.connection
db.on("error", console.error.bind(console, "Connection error :("))
db.once("open", () => {
  console.log("Database connected! :D")
})

const app = express()

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

// Boilerplate end

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map((e) => e.message).join(",")
    throw new ExpressError(msg, 400)
  } else {
    next()
  }
}

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body)
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

// === Get

app.get("/", (req, res) => {
  res.render("home")
})
app.get("/asd", (req, res) => {
  chicken.flasd()
})

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render("campgrounds/index", { campgrounds })
})

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new")
})

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params
    // console.log(id, { id })
    const campground = await Campground.findById(id).populate("reviews")
    // console.log(campground)
    res.render("campgrounds/show", { campground })
  })
)

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/edit", { campground, id })
  })
)

app.get("/secret", verifyPassword, (req, res) => {
  res.send("My secret!!")
})

// === Post

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect("/campgrounds")
  })
)

app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
  })
)

// === Put

app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true,
    })

    res.redirect(`/campgrounds/${id}`)
  })
)

// === Delete

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
  })
)

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
  })
)

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found!", 404))
})

app.use((err, req, res, next) => {
  if (!err.message) err.message = "Something went wrong :/"
  res.status(err.statusCode).render("error", { err })
})

app.listen(3000, () => {
  console.log("Listening on port 3000!")
})

const Campground = require("../models/campground")

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render("campgrounds/index", { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new")
}

module.exports.renderDetail = async (req, res, next) => {
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
}

module.exports.renderEdit = async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)

  if (!campground) {
    req.flash("error", "Campground not found!")
    return res.redirect("/campgrounds")
  }

  res.render("campgrounds/edit", { campground, id })
}

module.exports.createCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground)
  campground.author = req.user._id

  await campground.save()
  req.flash("success", "Successfully made a new campground!")
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.editCampground = async (req, res) => {
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
}

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  req.flash("success", "Successfully deleted a campground!")
  res.redirect("/campgrounds")
}

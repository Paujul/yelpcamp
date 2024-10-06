const Campground = require("../models/campground")
const { cloudinary } = require("../cloudinary")

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
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }))
  console.log(campground)

  await campground.save()
  req.flash("success", "Successfully made a new campground!")
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.editCampground = async (req, res) => {
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
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }))
  campground.images.push(...imgs)

  await campground.save()
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename)
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    })
    console.log(campground)
  }
  req.flash("success", "Campground updated!")
  res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params
  await Campground.findByIdAndDelete(id)
  req.flash("success", "Successfully deleted a campground!")
  res.redirect("/campgrounds")
}

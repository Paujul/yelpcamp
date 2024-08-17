const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const Campground = require("./models/campground")
const methodOverride = require("method-override")

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp")

const db = mongoose.connection
db.on("error", console.error.bind(console, "Connection error :("))
db.once("open", () => {
  console.log("Database connected! :D")
})

const app = express()

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

app.get("/", (req, res) => {
  res.render("home")
})

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({})
  res.render("campgrounds/index", { campgrounds })
})

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new")
})

app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params
  // console.log(id, { id })
  const campground = await Campground.findById(id)
  res.render("campgrounds/show", { campground })
})

app.get("/campgrounds/:id/edit", async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findById(id)
  res.render("campgrounds/edit", { campground, id })
})

app.post("/campgrounds", async (req, res) => {
  const campground = new Campground(req.body.campground)
  await campground.save()
  res.redirect("/campgrounds")
})

app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  })

  res.redirect(`/campgrounds/${id}`)
})

app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params
  const campground = await Campground.findByIdAndDelete(id)
  res.redirect("/campgrounds")
})

app.listen(3000, () => {
  console.log("Listening on port 3000!")
})

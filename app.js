const express = require("express")
const path = require("path")
const methodOverride = require("method-override")
const mongoose = require("mongoose")
const ejsMate = require("ejs-mate")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")

const User = require("./models/user")

const ExpressError = require("./utils/ExpressError")

const campgroundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")
const userRoutes = require("./routes/users")

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
app.use(express.static(path.join(__dirname, "public")))

// Boilerplate end

const sessionConfig = {
  secret: "icikiwir",
  resave: false,
  saveUninitialized: true,
  // store: mongoStore
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

// Store & unstore sessions.
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  // console.log(req.session)
  res.locals.currentUser = req.user
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  next()
})

//  Router Middlewares  //

app.get("/fakeuser", async (req, res) => {
  const user = new User({
    email: "asd@gmail.com",
    username: "asd",
  })
  const newUser = await User.register(user, "ccc")
  res.send(newUser)
})

app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)

app.get("/", (req, res) => {
  res.render("home")
})

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found!", 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) err.message = "Something went wrong :/"
  res.status(statusCode).render("error", { err })
})

app.listen(3000, () => {
  console.log("Listening on port 3000!")
})

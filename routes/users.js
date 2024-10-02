const express = require("express")
const router = express.Router()
const passport = require("passport")

const UserSchema = require("../schemas")
const User = require("../models/user")

const catchAsync = require("../utils/catchAsync")
const ExpressError = require("../utils/ExpressError")
const { storeReturnTo } = require("../middleware")

router.get("/register", (req, res) => {
  res.render("users/register")
})

router.get("/login", async (req, res) => {
  res.render("users/login")
})

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    req.flash("success", "Logged you out!")
    res.redirect("/campgrounds")
  })
})

router.post(
  "/register",
  catchAsync(async (req, res, next) => {
    try {
      const { email, username, password } = req.body
      const user = new User({ email, username })
      const registerUser = await User.register(user, password)

      req.login(registerUser, (err) => {
        err && next(err)
        req.flash("success", "Welcome to YelpCamp!")
        res.redirect("/campgrounds")
      })
    } catch (e) {
      req.flash("error", "User is already registered.")
      res.redirect("/register")
    }
  })
)

router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Welcome back!")
    const redirectUrl = res.locals.returnTo || "/campgrounds"
    res.redirect(redirectUrl)
  }
)

module.exports = router

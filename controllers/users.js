const User = require("../models/user")

module.exports.index = (req, res) => {
  res.render("users/register")
}

module.exports.renderLogin = (req, res) => {
  res.render("users/login")
}

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }
    req.flash("success", "Logged you out!")
    res.redirect("/campgrounds")
  })
}

module.exports.register = async (req, res, next) => {
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
}

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!")
  const redirectUrl = res.locals.returnTo || "/campgrounds"
  res.redirect(redirectUrl)
}

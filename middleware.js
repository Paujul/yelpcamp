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

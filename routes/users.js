const express = require("express")
const router = express.Router()
const passport = require("passport")

const users = require("../controllers/users")

const catchAsync = require("../utils/catchAsync")
const { storeReturnTo } = require("../middleware")

router.get("/register", users.index)

router.get("/login", users.renderLogin)

router.get("/logout", users.logout)

router.post("/register", catchAsync(users.register))

router.post(
  "/login",
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  users.login
)

module.exports = router

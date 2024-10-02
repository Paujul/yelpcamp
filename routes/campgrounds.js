const express = require("express")
const router = express.Router()

const campgrounds = require("../controllers/campgrounds")

const catchAsync = require("../utils/catchAsync")
const {
  isLoggedIn,
  validateCampground,
  isAuthor,
  isValid,
} = require("../middleware")

//  Routes  //
router.get("/", catchAsync(campgrounds.index))

router.get("/new", isLoggedIn, campgrounds.renderNewForm)

router.get("/:id", isValid, catchAsync(campgrounds.renderDetail))

router.get(
  "/:id/edit",
  isValid,
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEdit)
)

//      Post        //

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(campgrounds.createCampground)
)

//      Put     //

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(campgrounds.editCampground)
)

//      Delete      //

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.deleteCampground)
)

module.exports = router

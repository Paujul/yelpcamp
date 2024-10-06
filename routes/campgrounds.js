const express = require("express")
const multer = require("multer")
const { storage } = require("../cloudinary")
const upload = multer({ storage })

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
router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  )

router.get("/new", isLoggedIn, campgrounds.renderNewForm)

router
  .route("/:id")
  .get(isValid, catchAsync(campgrounds.renderDetail))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.editCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get(
  "/:id/edit",
  isLoggedIn,
  isValid,
  isAuthor,
  catchAsync(campgrounds.renderEdit)
)

module.exports = router

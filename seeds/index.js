const mongoose = require("mongoose")
const Campground = require("../models/campground")
const cities = require("./cities")
const { places, descriptors } = require("./seedHelpers")

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp")

const db = mongoose.connection
db.on("error", console.error.bind(console, "Connection error :("))
db.once("open", () => {
  console.log("Database connected! :D")
})

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000)

    // Seed DB pake cities yg dirandomin sm seedHelper buat randomize titlenya.
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
    })
    await camp.save()
  }
}

// Abis ngeseed langsung tutup nodenya biar gk CTRL+C lg.
seedDB().then(() => {
  mongoose.connection.close()
})

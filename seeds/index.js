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
    const price = Math.floor(Math.random() * 20) + 10
    // Seed DB pake cities yg dirandomin sm seedHelper buat randomize titlenya.
    const camp = new Campground({
      author: "66f6762d88cbb507d9807eec",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dkha2cdtw/image/upload/v1727938647/YelpCamp/vo1qazy2tgigpsxldy0m.png",
          filename: "YelpCamp/vo1qazy2tgigpsxldy0m",
        },
        {
          url: "https://res.cloudinary.com/dkha2cdtw/image/upload/v1727938647/YelpCamp/yfxtyd65uhlybpnbcn6o.png",
          filename: "YelpCamp/yfxtyd65uhlybpnbcn6o",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Facilis aliquid impedit veritatis tenetur quos, nesciunt quo quis modi autem ducimus laborum dolor dolore labore deserunt quia debitis, sed eius! Earum?",
      price,
    })
    await camp.save()
  }
}

// Abis ngeseed langsung tutup nodenya biar gk CTRL+C lg.
seedDB().then(() => {
  mongoose.connection.close()
})

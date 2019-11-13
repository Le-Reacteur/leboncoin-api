const express = require("express");
const fs = require("fs");
const router = express.Router();
var ObjectId = require("mongoose").Types.ObjectId;

const Offer = require("../models/Offer.js");
const User = require("../models/User.js");

router.get("/offers", function(req, res, next) {
  const offers = JSON.parse(fs.readFileSync("./data/products.json", "utf-8"));
  Offer.remove({}, async err => {
    if (!err) {
      try {
        await Offer.insertMany(offers);
        res.send("🎉 database has been renewed dudee!");
        //  process.exit();
      } catch (e) {
        console.log(e);
        res.send("An error occurred refilling db!");
        // process.exit();
      }
    } else {
      console.log(e);
      res.send("An error occurred removing collection!");
    }
  });
});

router.get("/users", async (req, res, next) => {
  let usersRemoved = 0;
  await User.deleteMany(
    { _id: { $nin: ObjectId("5bf53c45ad3fb30014389132") } },
    err => {
      if (!err) {
        usersRemoved++;
      }
    },
  );
  res.json(`${usersRemoved} users have been removed!`);
});

module.exports = router;

const express = require("express");
const fs = require("fs");
const router = express.Router();

/* const products = require("../data/products.json"); */
const Offer = require("../models/Offer.js");

router.get("/home", function(req, res, next) {
  return res.json([]);
});

router.get("/renew", function(req, res, next) {
  const offers = JSON.parse(fs.readFileSync("./data/products.json", "utf-8"));
  const renew = () => {
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
  };
  renew();
});

module.exports = router;

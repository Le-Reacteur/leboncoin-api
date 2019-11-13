const express = require("express");
const fs = require("fs");
const router = express.Router();

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

router.get("/users", function(req, res, next) {
  User.find({ _id: { $nin: "5bf53c45ad3fb30014389132" } }).exec(
    (err, users) => {
      res.json(users.length);
    },
  );
  /* User.findOneAndRemove(
          {
            _id: ObjectId(req.params.id),
            creator: req.user,
          },
          function(err, obj) {
            if (err) {
              return next(err.message);
            }
            if (!obj) {
              res.status(404);
              return next('Nothing to delete');
            } else {
              return res.json({ message: 'Deleted' });
            }
          }
        ); */
});

module.exports = router;

var express = require("express");
var router = express.Router();
var Offer = require("../models/Offer.js");
var isAuthenticated = require("../middlewares/isAuthenticated");
var ObjectId = require("mongoose").Types.ObjectId;

router.get("/", function(req, res) {
  const filter = {};
  if (req.query.priceMin !== undefined || req.query.priceMax !== undefined) {
    filter.price = {};
    if (req.query.priceMin !== undefined) {
      filter.price["$gte"] = req.query.priceMin;
    }
    if (req.query.priceMax !== undefined) {
      filter.price["$lte"] = req.query.priceMax;
    }
  }

  const query = Offer.find(filter).populate({
    path: "creator",
    select: "account"
  });

  if (req.query.skip !== undefined) {
    query.skip(parseInt(req.query.skip));
  }
  if (req.query.limit !== undefined) {
    query.limit(parseInt(req.query.limit));
  } else {
    // valeur par défaut de la limite
    query.limit(100);
  }

  switch (req.query.sort) {
    case "price-desc":
      query.sort({ price: -1 });
      break;
    case "price-asc":
      query.sort({ price: 1 });
      break;
    case "date-desc":
      query.sort({ created: -1 });
      break;
    case "date-asc":
      query.sort({ created: 1 });
      break;
    default:
  }

  query.exec(function(err, offers) {
    res.json(offers);
  });
});

router.get("/my-offers", isAuthenticated, function(req, res) {
  Offer.find({ creator: req.user })
    .populate({
      path: "creator",
      select: "account"
    })
    .exec(function(err, offers) {
      res.json(offers);
    });
});

router.delete("/remove/:id", isAuthenticated, function(req, res, next) {
  Offer.findOneAndRemove(
    { _id: ObjectId(req.params.id), creator: req.user },
    function(err, obj) {
      if (err) {
        return next(err.message);
      }
      if (!obj) {
        res.status(404);
        return next("Nothing to delete");
      } else {
        return res.json({ message: "Deleted" });
      }
    }
  );
});

// router.get("/modifier/:id", function(req, res) {
//   if (req.isAuthenticated()) {
//     Ad.find({ _id: req.params.id }, function(err, ad) {
//       console.log(ad);
//       if (ad.length) {
//         res.render("edit", {
//           infos: getInfos(req, "/modifier"),
//           ad
//         });
//       }
//     });
//   } else {
//     res.redirect("/");
//   }
// });

// router.post("/publier", upload.array("photos", 10), function(req, res) {
router.post("/publish", isAuthenticated, function(req, res, next) {
  // var photos = [];
  // if (req.files.length) {
  //   photos = _.map(req.files, function(file) {
  //     return file.filename;
  //   });
  // }

  var obj = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    // photos: photos,
    creator: req.user
  };
  var offer = new Offer(obj);
  offer.save(function(err) {
    if (!err) {
      return res.json({
        _id: offer._id,
        title: offer.title,
        description: offer.description,
        price: offer.price,
        created: offer.created,
        creator: {
          account: offer.creator.account,
          _id: offer.creator._id
        }
      });
    } else {
      return next(err.message);
    }
  });
});

router.get("/:id", function(req, res, next) {
  Offer.findById(req.params.id)
    .populate({
      path: "creator",
      select: "account"
    })
    .exec(function(err, offer) {
      if (err) {
        return next(err.message);
      }
      if (!offer) {
        res.status(404);
        return next("Not found");
      } else {
        return res.json(offer);
      }
    });
});

module.exports = router;
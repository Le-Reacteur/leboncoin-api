var express = require("express");
var router = express.Router();
var Offer = require("../models/Offer.js");
var isAuthenticated = require("../middlewares/isAuthenticated");
var ObjectId = require("mongoose").Types.ObjectId;
const uid2 = require("uid2");

// Importation de Cloudinary
var cloudinary = require("cloudinary");
// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get("/", function(req, res) {
  const filter = {};
  if (
    (req.query.priceMin !== undefined && req.query.priceMin !== "") ||
    (req.query.priceMax !== undefined && req.query.priceMax !== "")
  ) {
    filter.price = {};
    if (req.query.priceMin) {
      filter.price["$gte"] = req.query.priceMin;
    }

    if (req.query.priceMax) {
      filter.price["$lte"] = req.query.priceMax;
    }
  }

  if (req.query.title) {
    filter.title = {
      $regex: req.query.title,
      $options: "i"
    };
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

router.get("/with-counter", function(req, res) {
  const filter = {};
  if (
    (req.query.priceMin !== undefined && req.query.priceMin !== "") ||
    (req.query.priceMax !== undefined && req.query.priceMax !== "")
  ) {
    filter.price = {};
    if (req.query.priceMin) {
      filter.price["$gte"] = req.query.priceMin;
    }

    if (req.query.priceMax) {
      filter.price["$lte"] = req.query.priceMax;
    }
  }

  if (req.query.title) {
    filter.title = {
      $regex: req.query.title,
      $options: "i"
    };
  }

  Offer.count({}, (err, count) => {
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

    query.exec((err, offers) => {
      res.json({ count, offers });
    });
  });
});

router.get("/with-count", function(req, res) {
  const filter = {};
  if (
    (req.query.priceMin !== undefined && req.query.priceMin !== "") ||
    (req.query.priceMax !== undefined && req.query.priceMax !== "")
  ) {
    filter.price = {};
    if (req.query.priceMin) {
      filter.price["$gte"] = req.query.priceMin;
    }

    if (req.query.priceMax) {
      filter.price["$lte"] = req.query.priceMax;
    }
  }

  if (req.query.title) {
    filter.title = {
      $regex: req.query.title,
      $options: "i"
    };
  }

  Offer.count(filter, (err, count) => {
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

    query.exec((err, offers) => {
      res.json({ count, offers });
    });
  });
});

router.get("/my-offers", isAuthenticated, function(req, res) {
  Offer.find({ creator: req.user })
    .populate({ path: "creator", select: "account" })
    .exec(function(err, offers) {
      res.json(offers);
    });
});

router.delete("/remove/:id", isAuthenticated, function(req, res, next) {
  Offer.findOneAndRemove(
    {
      _id: ObjectId(req.params.id),
      creator: req.user
    },
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

const uploadPictures = (req, res, next) => {
  // J'initialise un tableau vide pour y stocker mes images uploadées
  const pictures = [];
  // J'initialise le nombre d'upload à zéro
  let filesUploaded = 0;
  // Et pour chaque fichier dans le tableau, je crée un upload vers Cloudinary
  const files = Object.keys(req.files);
  if (files.length) {
    files.forEach(fileKey => {
      // Je crée un nom spécifique pour le fichier
      const name = uid2(16);
      cloudinary.v2.uploader.upload(
        req.files[fileKey].path,
        {
          // J'assigne un dossier spécifique dans Cloudinary pour chaque utilisateur
          public_id: `leboncoin/${req.user._id}/${name}`
        },
        (error, result) => {
          console.log(error, result);
          // Si j'ai une erreur avec l'upload, je sors de ma route
          if (error) {
            return res.status(500).json({ error });
          }
          // Sinon, je push mon image dans le tableau
          pictures.push(result.secure_url);
          // Et j'incrémente le nombre d'upload
          filesUploaded++;
          console.log("-------\n", result);
          // Si le nombre d'uploads est égal au nombre de fichiers envoyés...
          if (filesUploaded === files.length) {
            /* res
                        .status(200)
                        .json({message: `You've uploaded ${filesUploaded} files.`}); */
            // ... je stocke les images dans l'objet `req`...
            req.pictures = pictures;
            // ... et je poursuis ma route avec `next()`
            next();
          }
        }
      );
    });
  } else {
    // Pas de fichier à uploader ? Je poursuis ma route avec `next()`.
    next();
  }
};

router.post("/publish", isAuthenticated, uploadPictures, function(
  req,
  res,
  next
) {
  var obj = {
    title: req.fields.title,
    description: req.fields.description,
    price: req.fields.price,
    pictures: req.pictures,
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
        pictures: offer.pictures,
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

// Cette route est utilisée dans le cadre de la formation "LBC-ACADEMY"
router.post("/lbc-academy/upload", isAuthenticated, (req, res) => {
  console.log("route");

  // les différents clés des fichiers (file1, file2, file3...)
  const files = Object.keys(req.files);
  if (files.length) {
    const results = {};
    // on parcours les fichiers
    files.forEach(fileKey => {
      // on utilise les path de chaque fichier (la localisation temporaire du fichier sur le serveur)
      cloudinary.v2.uploader.upload(
        req.files[fileKey].path,
        {
          // on peut préciser un dossier
          folder: "some_folder"
        },
        (error, result) => {
          // on enregistre le résultat dans un object
          if (error) {
            results[fileKey] = {
              success: false,
              error: error
            };
          } else {
            results[fileKey] = {
              success: true,
              result: result
            };
          }
          if (Object.keys(results).length === files.length) {
            // tous les uploads sont fait on peut envoyer la réponse
            return res.json(results);
          }
        }
      );
    });
  } else {
    res.send("no file uploaded");
  }
});

// Cette route est utilisée dans le cadre de la formation "LBC-ACADEMY"
router.post("/lbc-academy/publish", isAuthenticated, function(req, res, next) {
  var obj = {
    title: req.fields.title,
    description: req.fields.description,
    price: req.fields.price,
    pictures: req.pictures,
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
        pictures: offer.pictures,
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
    .populate({ path: "creator", select: "account" })
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

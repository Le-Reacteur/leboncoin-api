const express = require("express");
const router = express.Router();

router.get("/home", function(req, res, next) {
  return res.json([]);
});

module.exports = router;

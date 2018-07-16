var passport = require("passport");

module.exports = (req, res, next) => {
  passport.authenticate("bearer", { session: false }, function(err, user) {
    req.user = user;

    if (err) {
      res.status(400);
      return next(err.message);
    }
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      return next();
    }
  })(req, res, next);
};

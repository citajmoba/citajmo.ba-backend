const { authJwt } = require("../middleware");
const controller = require("../controllers/access.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/access/all", controller.allAccess);

  app.get(
    "/api/access/user",
    [authJwt.verifyToken],
    controller.userBoard
  );

  app.get(
    "/api/access/contributor",
    [authJwt.verifyToken, authJwt.isContributor],
    controller.contributorBoard
  );

  app.get(
    "/api/access/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );
};
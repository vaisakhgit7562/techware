import { Router } from "express";

const user = require("../controllers/user.controller");
const auth = require("../controllers/auth.controller");
const paid = require("../controllers/paid.controller");
module.exports = (app) => {
  const router = Router();
  router.get("/:id", user.dashboard);
  router.post("/payment", paid.create);
  app.use("/api/user", auth.verifyToken, router);
};

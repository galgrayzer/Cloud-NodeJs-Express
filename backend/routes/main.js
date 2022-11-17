const router = require("express").Router();

const mainC = require("../controllers/mainController");

router.get("/", mainC.getMain);

module.exports = router;

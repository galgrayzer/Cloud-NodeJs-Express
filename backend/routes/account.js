const router = require("express").Router();
const { check, body } = require("express-validator");
const auth = require("../middlewares/isAuth");

const accountController = require("../controllers/account/accountController");
const loginController = require("../controllers/account/loginController");
const signupController = require("../controllers/account/signupController");
const resetController = require("../controllers/account/resetController");

router.get("/login", auth.isNotLogged, loginController.getLogin);

router.post("/login", auth.isNotLogged, loginController.postLogin);

router.get("/signup", auth.isNotLogged, signupController.getSignup);

router.post(
  "/signup",
  auth.isNotLogged,
  body("username", "Username not valid")
    .isAlphanumeric()
    .isLength({ min: 1, max: 20 }),
  check("email", "Email not valid").isEmail(),
  body("password", "Password not valid").isLength({ min: 8 }),
  signupController.postSignup
);

router.post("/logout", auth.authVerification, accountController.postLogout);

router.get("/reset-password", resetController.getReset);

router.post("/reset-password", resetController.postReset);

router.get("/reset-password/:token", resetController.getUpdateP);

router.post(
  "/update-password",
  body("password", "Password not valid").isLength({ min: 8 }),
  resetController.postUpdateP
);

router.get("/account", auth.authVerification, accountController.getAccount);

router.post(
  "/account",
  auth.authVerification,
  body("username", "Username not valid")
    .isAlphanumeric()
    .isLength({ min: 1, max: 20 }),
  check("email", "Email not valid").isEmail(),
  accountController.postAccount
);

router.get(
  "/delete-account",
  auth.authVerification,
  accountController.getDelete
);

router.post(
  "/delete-account",
  auth.authVerification,
  accountController.postDelete
);

module.exports = router;

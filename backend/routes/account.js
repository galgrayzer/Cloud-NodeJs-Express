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
    .custom((username) => !username.includes(" "))
    .withMessage("Username can't include spaces")
    .isLength({ max: 20, min: 1 })
    .withMessage("Username length invalid"),
  check("email", "Email not valid").isEmail(),
  body("password", "Password not valid")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 chars long"),
  signupController.postSignup
);

router.post("/gsignup", auth.isNotLogged, signupController.postGoogle);

router.post("/logout", auth.authVerification, accountController.postLogout);

router.get("/reset-password", resetController.getReset);

router.post("/reset-password", resetController.postReset);

router.get("/reset-password/:token", resetController.getUpdateP);

router.post(
  "/update-password",
  body("password", "Password not valid")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 chars long"),
  resetController.postUpdateP
);

router.get("/account", auth.authVerification, accountController.getAccount);

router.post(
  "/account",
  auth.authVerification,
  body("username", "Username not valid")
    .isLength({ max: 20, min: 1 })
    .withMessage("Username length invalid"),
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

const router = require("express").Router();
const auth = require("../middlewares/isAuth");

const filesC = require("../controllers/files/filesController.js");
const shareC = require("../controllers/files/shareController");

router.get("/files", auth.authVerification, filesC.getFiles);

router.post("/add-file", auth.authVerification, filesC.postAddFile);

router.post(
  "/delete-file/:fileId",
  auth.authVerification,
  filesC.postDeleteFile
);

router.get("/file/:fileId", auth.authVerification, filesC.getDownload);

router.get("/share-file/:fileId", auth.authVerification, shareC.getShare);

router.post("/share-file/:fileId", auth.authVerification, shareC.postShare);

router.get("/get-share/:token", auth.authVerification, shareC.getGetShare);

router.post("/lock/:fileId", auth.authVerification, filesC.postLock);

module.exports = router;

exports.getMain = (req, res, next) => {
  res.render("main-page", {
    document: "Welcome",
  });
};

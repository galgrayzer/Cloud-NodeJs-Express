exports.e404 = (req, res, next) => {
  res.status(404).render("404", {
    document: "Page not found",
  });
};

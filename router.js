const {
  signup,
  signin,
  me,
  // updateProfile,
  // changePassword,
  // forgotPassword,
  // resetPassword,
} = require("./controllers/user");
const {
  createProduct,
  getProducts,
  getOneProduct,
  deleteProduct,
  updateProduct,
} = require("./controllers/product");
const { upload } = require("./utils/fileUpload");

const passport = require("passport");
require("./services/passport")(passport);

const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignIn = passport.authenticate("local-login", { session: false });

module.exports = function (app) {
  app.get("/", (req, res, next) => {
    res.send("Testing");
  });

  app.post("/api/signup", signup);
  app.post("/api/signin", requireSignIn, signin);
  app.get("/api/me", requireAuth, me);
  // app.post("/api/profile", requireAuth, updateProfile);
  // app.post("/api/changePassword", requireAuth, changePassword);
  // app.post("/api/forgotPassword", forgotPassword);
  // app.put("/api/resetpassword/:resetToken", resetPassword);

  app.post(
    "/api/createProduct",
    requireAuth,
    upload.single("image"),
    createProduct
  );
  app.get("/api/getProducts", requireAuth, getProducts);
  app.get("/api/getProduct/:id", requireAuth, getOneProduct);
  app.post("/api/deleteProduct/:id", requireAuth, deleteProduct);
  app.post(
    "/api/updateProduct/:id",
    requireAuth,
    upload.single("image"),
    updateProduct
  );
};

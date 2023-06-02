const User = require("../models/user");
const config = require("../config");
const jwt = require("jwt-simple");
const bcrypt = require("bcryptjs");

const tokenForUser = (user) => {
  const timestamp = new Date().getTime();
  const expirationTime = timestamp + 60 * 60 * 1000;
  return jwt.encode(
    { sub: user._id, iat: timestamp, exp: expirationTime },
    config.secret
  );
};

module.exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).send({ error: "Missing required fields." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .send({ error: "Password must be up to 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(422).send({ error: "Email is in use." });

    const user = await new User({ name, email, password }).save();
    res.send({
      token: tokenForUser(user),
      success: true,
      message: "User registered successfully!",
      user,
    });
  } catch (err) {
    res.status(400).send({ error: "Cannot create user." });
  }
};

module.exports.signin = async (req, res) => {
  // user has already had their email and password authenticated
  // we just need to give them a token
  res.send({
    token: tokenForUser(req.user),
    success: true,
    message: "User signed-in successfully!",
    role: req.user.role,
  });
};

module.exports.me = async (req, res) => {
  res.send({ user: req.user });
};

// module.exports.updateProfile = async (req, res) => {
//   // if (Object.keys(req.body).length === 0)
//   //   return res.send({ message: "Nothing changed" });
//   const user = await User.findByIdAndUpdate(req.user._id, req.body);
//   res.send({ success: true, user, message: "User updated successfully!" });
// };

// module.exports.changePassword = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const { oldPassword, password } = req.body;

//     //Validate
//     if (!oldPassword || !password) {
//       return res
//         .status(400)
//         .send({ error: "Please add old and new password." });
//     }

//     // check if old password matches password in DB
//     const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

//     if (passwordIsCorrect) {
//       user.password = password;
//       await user.save();
//       res.send({ success: true, message: "Password changed successful", user });
//     } else {
//       return res.status(400).send({ error: "Old password is incorrect." });
//     }
//   } catch (err) {
//     res.status(400).send({ error: "Cannot change password." });
//   }
// };

// module.exports.forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       res.status(400).send({ error: "User does not exist." });
//     }

//     // Delete token if it exists in DB
//     let token = await Token.findOne({ userId: user._id });
//     if (token) {
//       await token.deleteOne();
//     }

//     // Create Reset Token
//     let resetToken = crypto.randomBytes(32).toString("hex") + user._id;

//     // Hash token before saving to DB
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     // Save Token to DB
//     await new Token({
//       userId: user._id,
//       token: hashedToken,
//       createdAt: Date.now(),
//       expiresAt: Date.now() + 30 * (60 * 1000), // Thirty minutes
//     }).save();

//     // Construct Reset Url
//     const resetUrl = `${process.env.FRONTEND_URL}resetpassword/${resetToken}`;

//     // Reset Email
//     const message = `
//       <h2>Hello ${user.name}</h2>
//       <p>Please use the url below to reset your password</p>
//       <p>This reset link is valid for only 30minutes.</p>
//       <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
//       <p>Regards...</p>
//       <p>Pinvent Team</p>
// `;
//     const subject = "Password Reset Request";
//     const send_to = user.email;
//     const sent_from = process.env.EMAIL_USER;

//     try {
//       await sendEmail(subject, message, send_to, sent_from);
//       res.send({ success: true, message: "Reset Email Sent" });
//     } catch (error) {
//       res.status(400).send("Email not sent, please try again");
//     }
//   } catch (err) {
//     res.status(400).send({ error: "Cannot reset password." });
//   }
// };

// module.exports.resetPassword = async (req, res) => {
//   const { password } = req.body;
//   const { resetToken } = req.params;

//   // Hash token, then compare to Token in DB
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(resetToken)
//     .digest("hex");

//   // find token in DB
//   const userToken = await Token.findOne({
//     token: hashedToken,
//     expiresAt: { $gt: Date.now() },
//   });

//   if (!userToken) {
//     res.status(400).send({ error: "Invalid or Expired Token." });
//   }

//   // Find user
//   const user = await User.findOne({ _id: userToken.userId });
//   user.password = password;
//   await user.save();
//   res.send({
//     success: true,
//     message: "Password Reset Successful, Please Login",
//   });
// };

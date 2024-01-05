const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Pleae add a firstname"],
  },
  lastname: {
    type: String,
    required: [true, "Pleae add a lastname"],
  },
  email: {
    type: String,
    required: [true, "Please add an email address"],
    unique: [true, "This email has been used before"],
    validate: [validator.isEmail, "please add a valid emai"],
  },
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
  ],
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wishlist",
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  password: {
    type: String,
    required: [true, "Input a password"],
    Select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Reenter a correct password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password and confirm password are not the same",
    },
  },
  isAdmin : {
    type: Boolean,
    default: false
  },
  userImage: String,
  passwordResetToken: String,
  paswordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};


//reset Password token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);

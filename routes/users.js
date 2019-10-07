const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

// User model
const User = require("../models/User");

// Login Page
router.get("/login", (req, res) => res.render("login"));

// Login Page
router.get("/register", (req, res) => res.render("register"));

// Register handle
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;

  let errors = [];
  if (!name) {
    errors.push("Name is required");
  }
  if (!email) {
    errors.push("Email is required");
  }
  if (!password) {
    errors.push("Password is required");
  }
  if (!password2) {
    errors.push("You must type in password2 field");
  }

  if (password !== password2) {
    errors.push("Passwords do not match");
  }

  if (password.length < 6) {
    errors.push("Password must be 6 or more characters");
  }

  if (errors.length > 0) {
    return res.render("register", {
      errors,
      name,
      email,
      password,
      password2
    });
  }

  //  Validate passed
  User.findOne({ email })
    .then(user => {
      if (user) {
        // User exists
        errors.push("Email is already registered");
        console.log(errors);
        return res.render("register", {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          password2
        });

        bcrypt.genSalt((err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            // Set password to hashed
            newUser.password = hash;
            // Save user
            User.create(newUser)
              .then(user => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in!"
                );
                res.redirect("/users/login");
              })
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => console.log(err));
});

// Login Handle
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Logout Handle
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You have been logged out");
  res.redirect("/users/login");
});

module.exports = router;

const express = require("express");
const User = require("../Models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
//const { findOne } = require('../Models/User');
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const JWT_SECRET = "Thisismysecret!@#";
const fetchuser = require("../Middleware/fetchuser");

//ROUTE : 1 Create a user using POST , No login required Endpoint localhost:5000/api/auth/createUser
router.post(
  "/createUser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    // If there are errors, return error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //Check if a user with this email exists

    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({
          success,
          error: " Sorry an user with this email id exists already",
        });
      }
      //creating a salt
      const salt = await bcrypt.genSalt(10); // await means please stop until we have got the value as bcrypt.gensalt() return a promise
      const secPass = await bcrypt.hash(req.body.password, salt);
      //create a new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      //user created with a unique id
      // now we will not send user as response
      // res.json(user);
      const data = { user: { id: user.id } };
      const auth_token = jwt.sign(data, JWT_SECRET);
      // console.log(jwt_data);
      success = true;
      res.json({ success, auth_token });
    } catch (error) {
      console.log(error);
      res.send(500).send({ error: "Some error Occured" });
    }

    //   .then(user=>res.json(user))
    //   .catch(err => console.log(err) ,
    //   res.json({error : 'Please enter a unique value for email' , message : err.message}));
  }
);
//ROUTE : 2 // Login a user using POST , No login required Endpoint localhost:5000/api/auth/login
router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //destructuring the email and password what we got
    const { email, password } = req.body;

    try {
      //first find the user from the database using the email id
      //just like select command in sql
      let user = await User.findOne({ email: email });
      //if user does not exists
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" }); // not correct email as we dont want to give out the information that email is wrong
      }

      const passwordCompare = await bcrypt.compare(password, user.password);

      if (!passwordCompare) {
        return res.status(400).json({
          success,
          error: "Please try to login with correct credentials",
        });
      }

      const data = { user: { id: user.id } };
      const auth_token = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, auth_token });
    } catch (error) {
      console.log(error);
      res.send(500).send({ error: "Internal Server Error" });
    }
  }
);

//ROUTE : 3 // Get logged in user details  using POST ,  LOGIN REQUIRED Endpoint localhost:5000/api/auth/getUser
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error);
    res.send(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;

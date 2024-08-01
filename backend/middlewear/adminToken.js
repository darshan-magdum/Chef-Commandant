// adminToken.js
const jwt = require('jsonwebtoken');
const { jwtkey } = require('../keys');
const { AdminSignup } = require('../models/AdminSignup');

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).send({ error: "You must be logged in" });
  }
  const token = authorization.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, jwtkey);
    const { adminId } = payload;
    const admin = await AdminSignup.findById(adminId);
    if (!admin) {
      return res.status(401).send({ error: "Admin not authorized" });
    }
    req.admin = admin;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).send({ error: "Invalid token" });
  }
};

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const VendorEmployee = require('../models/VendorMember');
const { jwtkey } = require('../keys');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  // authorization === Bearer sfafsafa
  if (!authorization) {
    return res.status(401).send({ error: "You must be logged in" });
  }
  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, jwtkey, async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: "You must be logged in" });
    }
    const { vendoremployeeId } = payload;
    const vendoremployee = await VendorEmployee.findById(vendoremployeeId);
    req.vendoremployee = vendoremployee;
    next();
  });
};

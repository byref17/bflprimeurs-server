const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const { isAuthenticated } = require("../middleware/jwt.middleware.js");

// Require the User model in order to interact with the database
const User = require("../models/User.model");

const Item = require("../models/Item.model");

const Order = require("../models/Order.model")

// PUT /api/user/:id
router.put("/user/:userId", (req, res,) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  User.findByIdAndUpdate(userId, req.body, { new: true })
    .then((createdUser) => {
      // Deconstruct the newly created user object to omit the password
      // We should never expose passwords publicly
      const { email, societe, _id, telephone, adresse, siret } = createdUser;

      // Create a new object that doesn't expose the password
      const user = { email, societe, _id, telephone, adresse, siret };

      // Send a json response containing the user object
      res.status(201).json({ user: user });
    })
    .catch(error => res.json(error));
});

// listing des produits

router.get('/items', (req, res) => {

  //
  // 1. determiner le type d'items: legume, fruit, aromate
  // 2. retrouver en base tous les items de ce type (1.)
  // 3. reponse du server sous forme json
  //

  // 2.
  Item.find({ family: req.query.family })
    .then(function (itemsFromDb) {
      // 3.
      res.json(itemsFromDb)
    })
    .catch(function (err) {
      next(err) // appel le middleware d'erreur
    })
});

// Création d'une commande

router.post('/orders', isAuthenticated, (req, res, next) => {

  //
  //  
  //

  // [100, 101]
  const ids = req.body.map(function (el) {
    return el.id
  })

  Item.find({ _id: { $in: ids } })
    .then(function (itemsFromDB) {
      // je cree une nouvelle commande
      const order = new Order({
        userId: req.payload._id, // req.payload._id
        date: new Date(), // maintenant
        items: itemsFromDB.map(function (item, i) {
          return ({
            itemId: item._id,
            quantity: req.body[i].qty,
            prix: item.prix
          })
        }),

      })

      // je la persiste en base
      order.save()
        .then(function (orderFromDB) {
          // 
          res.status(201).json(orderFromDB)
        })
        .catch(function (err) {
          next(err) // appel le middleware d'erreur
        })
    })
    .catch(err => next(err))


});

router.get('/orders', isAuthenticated, (req, res, next) => {

  Order.find()
    .then(function (ordersFromDb) {
      res.json(ordersFromDb)
    })
    .catch(function (err) {
      next(err) // appel le middleware d'erreur
    })
});

router.get('/orders/:id', isAuthenticated, (req, res, next) => {
  Order.findById(req.params.id)
    .then(function (ordersFromDB) {
      res.json(ordersFromDB)
    })
    .catch(function (err) {
      next(err)
    })
});

module.exports = router;

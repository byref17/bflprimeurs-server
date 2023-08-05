const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const { isAuthenticated } = require("../middleware/jwt.middleware.js");

// Require the User model in order to interact with the database
const User = require("../models/User.model");

const Item = require("../models/Item.model");

const Order = require("../models/Order.model")
// GET /api/user/:id
router.get("/user", isAuthenticated, (req, res,) => {
  const userId = req.payload._id

  User.findById(userId, req.body,)
    .then((profilUser) => {
      // Deconstruct the newly created user object to omit the password
      // We should never expose passwords publicly
      const { email, societe, _id, telephone, adresse, siret } = profilUser;

      // Create a new object that doesn't expose the password
      const user = { email, societe, _id, telephone, adresse, siret };

      // Send a json response containing the user object
      res.status(200).json({ user: user });
    })
    .catch(error => res.json(error));
});

// PUT /api/user/:id
router.put("/user", isAuthenticated, (req, res,) => {
  const userId = req.payload._id

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
//
// GET /items
// GET /items?family=
// GET /items?id=1234&id=2345
router.get('/items', (req, res, next) => {

  //
  // 1. determiner le type d'items: legume, fruit, aromate
  // 2. retrouver en base tous les items de ce type (1.)
  // 3. reponse du server sous forme json
  //

  const query = {}

  // query vaut { family: req.query.family }
  if (req.query.family) {
    query.family = req.query.family
  }

  // query vaut { _id: { $in: id } }
  if (req.query.id) {
    query._id = { $in: req.query.id }
  }

  // 2.
  Item.find(query)
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
  //  req.body:  [ {id: '1234', qty: 1}, ... ]
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
            title: item.title,
            colisage: item.colisage,
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

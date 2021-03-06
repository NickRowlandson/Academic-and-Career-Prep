import express = require("express");
import jwt = require('jsonwebtoken');
import bcrypt = require('bcrypt');
import AuthController = require("../controllers/AuthController");
const MailService = require("../services/MailService");
var sql = require('mssql');
var auth = ["Admin"];

var config = require('../config');
config = config.db;
/**
    The staff controller communicates with the client
    side in order to manage all staff CRUD operations.
*/
class StaffController {

    /** Create new staff record */
    create(req: express.Request, res: express.Response): void {
        try {
            new AuthController().authUser(req, res, {
                requiredAuth: auth, done: function() {
                    var randomstring = Math.random().toString(36).slice(-8);
                    randomstring = randomstring.charAt(0).toUpperCase() + randomstring.slice(1);
                    var salt = bcrypt.genSaltSync(10);
                    // Hash the password with the salt
                    var password = bcrypt.hashSync(randomstring, salt);
                    req.body.password = password;
                    req.body.username = req.body.firstName + req.body.lastName;
                    req.body.username = req.body.username.toLowerCase();
                    req.body.username = req.body.username.replace(/\s+/g, '');
                    var staff = req.body;
                    sql.connect(config)
                    .then(function(connection) {
                      new sql.Request(connection)
                          .query("SELECT * FROM Users")
                          .then(function(users) {
                            var validated = true;
                            var error;
                            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            var emailValidation = re.test(staff.email);
                            for (let user of users) {
                              if (user.username === staff.username) {
                                validated = false;
                                error = "username in use";
                                break;
                              }
                              if (user.email === staff.email) {
                                  validated = false;
                                  error = "email in use";
                                  break;
                              }
                            }
                            if (!emailValidation) {
                              validated = false;
                              error = "incorrect email format";
                            }
                            if (validated) {
                              new sql.Request(connection)
                                  .query("INSERT INTO Users VALUES ('" + staff.username + "','" + staff.email + "','" + staff.password + "','" + staff.userType + "','false')")
                                  .then(function() {
                                      new sql.Request(connection)
                                          .query("SELECT userID FROM Users WHERE username = '" + staff.username + "' AND password = '" + staff.password + "'")
                                          .then(function(id) {
                                              new sql.Request(connection)
                                                  .query("INSERT INTO Staff VALUES ('" + id[0].userID + "','" + staff.firstName + "', '" + staff.lastName + "')")
                                                  .then(function() {
                                                      // setup email data with unicode symbols
                                                      let mailOptions = {
                                                        from: '"Georgian Academic & Career Prep"', // sender address
                                                        to: staff.email, // list of receivers
                                                        subject: 'Welcome!', // Subject line
                                                        text: '', // plain text body
                                                        html: 'Your username is <b>' + staff.username + '</b> and here is your new temporary password: <b>' + randomstring + '</b><br /> Please login at http://georgianapp.azurewebsites.net  <br /><br /> Thankyou'// html body
                                                      };

                                                      new MailService().sendMessage("Welcome Staff", mailOptions);
                                                      res.send({ "success": "success" });
                                                  }).catch(function(err) {
                                                      res.send({ "error": "error" });
                                                      console.log("insert staff " + err);
                                                  });
                                          }).catch(function(err) {
                                              res.send({ "error": "error" });
                                              console.log("get user " + err);
                                          });
                                  }).catch(function(err) {
                                      res.send({ "error": "error" });
                                      console.log("insert user " + err);
                                  });
                            } else {
                              res.send({"error": error})
                            }
                          }).catch(function(err) {
                              res.send({ "error": "error" });
                              console.log("select all users " + err);
                        });
                    }).catch(function(err) {
                        console.log(err);
                        res.send({ "error": "error in your request" });
                    });
                }
            });
        }
        catch (e) {
            console.log(e);
            res.send({ "error": "error in your request" });
        }
    }

    /** Update staff record by ID */
    update(req: express.Request, res: express.Response): void {
        try {
            new AuthController().authUser(req, res, {
                requiredAuth: auth, done: function() {
                    var validated = true;
                    var user = req.body;
                    var _id: string = req.params._id;
                    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    var emailValidation = re.test(user.email);
                    if (!emailValidation) {
                      validated = false;
                      var error = "incorrect email format";
                    }
                    if (validated) {
                    sql.connect(config)
                    .then(function(connection) {
                        new sql.Request(connection)
                            .query("UPDATE Users SET userType='" + user.userType + "', email='" + user.email + "' WHERE userID = '" + _id + "'")
                            .then(function() {
                                res.send({ "success": "success" });
                            }).catch(function(err) {
                                res.send({ "error": "error" });
                                console.log("Update user " + err);
                            });
                    }).catch(function(err) {
                        console.log(err);
                        res.send({ "error": "error in your request" });
                    });
                  } else {
                    res.send({"error": error})
                  }
                }
            });
        }
        catch (e) {
            console.log(e);
            res.send({ "error": "error in your request" });
        }
    }

    /** Delete selected record from Staff table by ID  */
    delete(req: express.Request, res: express.Response): void {
        try {
            new AuthController().authUser(req, res, {
                requiredAuth: auth, done: function() {
                    var _id: string = req.params._id;
                    sql.connect(config)
                    .then(function(connection) {
                        new sql.Request(connection)
                            .query("DELETE FROM Staff WHERE userID = '" + _id + "'")
                            .then(function() {
                                new sql.Request(connection)
                                    .query("DELETE FROM Users WHERE userID = '" + _id + "'")
                                    .then(function() {
                                        res.send({ "success": "success" });
                                    }).catch(function(err) {
                                        res.send({ "error": "error" });
                                        console.log("Delete user with id " + _id + ". " + err);
                                    });
                            }).catch(function(err) {
                                res.send({ "error": "error" });
                                console.log("Delete staff with id " + _id + ". " + err);
                            });
                    }).catch(function(err) {
                        console.log(err);
                        res.send({ "error": "error in your request" });
                    });
                }
            });
        }
        catch (e) {
            console.log(e);
            res.send({ "error": "error in your request" });
        }
    }

    /** Get all staff records from Staff table */
    retrieve(req: express.Request, res: express.Response): void {
        try {
            new AuthController().authUser(req, res, {
                requiredAuth: auth, done: function() {
                    sql.connect(config)
                    .then(function(connection) {
                        new sql.Request(connection)
                            .query('SELECT Staff.*, Users.userType, Users.email, Users.active, Users.username FROM Staff LEFT JOIN Users ON Users.userID = Staff.userID')
                            .then(function(recordset) {
                                res.send(recordset);
                            }).catch(function(err) {
                                res.send({ "error": "error" });
                                console.log("Select all staff " + err);
                            });
                    }).catch(function(err) {
                        console.log(err);
                        res.send({ "error": "error in your request" });
                    });
                }
            });
        }
        catch (e) {
            console.log(e);
            res.send({ "error": "error in your request" });
        }
    }

    /** Get staff info by ID */
    findById(req: express.Request, res: express.Response): void {
        try {
            new AuthController().authUser(req, res, {
                requiredAuth: auth, done: function() {
                    var _id: string = req.params._id;
                    sql.connect(config)
                    .then(function(connection) {
                        new sql.Request(connection)
                            .query("SELECT firstName, lastName, email, userType FROM Staff INNER JOIN Users ON Staff.userID = Users.userID WHERE Staff.userID = '" + _id + "'")
                            .then(function(recordset) {
                                res.send(recordset[0]);
                            }).catch(function(err) {
                                res.send({ "error": "error" });
                                console.log("NOPE " + err);
                            });
                    }).catch(function(err) {
                        console.log(err);
                        res.send({ "error": "error in your request" });
                    });
                }
            });
        }
        catch (e) {
            console.log(e);
            res.send({ "error": "error in your request" });
        }
    }

}
export = StaffController;

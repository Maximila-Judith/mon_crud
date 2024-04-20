//Imports
let bcrypt = require('bcrypt')
let utils = require('../utils/jwt.utils')
let models = require('../models')
let jwtUtils = require('../utils/jwt.utils')
let asyncLib = require('async')

// Constants
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/

//Routes
module.exports = {
    register: function (req, res) {

        //Params
        let email = req.body.email
        let username = req.body.username
        let password = req.body.password
        let bio = req.body.bio

        console.log(req.body);

        if (!email || !username || !password) {
            return res.status(400).json({ 'error': 'missing parameters' })
        }

        if (username.length >= 13 || username.length <= 4) {
            return res.status(400).json({ 'error': 'missing parameters' })
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ 'error': 'email is not valid' })
        }

        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ 'error': 'password invalid (must lenght 4 - 8 include 1 number at' })
        }

        asyncLib.waterfall([
            function (done) {
                models.User.findOne({
                    attributes: ['email'],
                    where: { email: email }
                })
                    .then(function (userFound) {
                        done(null, userFound)
                    })
                    .catch(function (err) {
                        return res.status(500).json({ 'error': 'unable to verify user' })
                    })
                //done(null, 'variable1')
            },
            function (userFound, done) {
                if (!userFound) {
                    bcrypt.hash(password, 5, function (err, bcryptedPassword) {
                        done(null, userFound, bcryptedPassword)
                    })
                } else {
                    return res.status(409).json({ 'error': 'user already exist' })
                }
                //done(null)
            },
            function (userFound, bcryptedPassword, done) {
                console.log("Creating new user with data:", {
                    email: email,
                    username: username,
                    password: bcryptedPassword,
                    bio: bio,
                    isAdmin: 0
                });
                let newUser = models.User.create({
                    email: email,
                    username: username,
                    password: bcryptedPassword,
                    bio: bio,
                    isAdmin: 0
                })
                    .then(function (newUser) {
                        done(newUser)
                    })
                    .catch(function (err) {
                        console.error('Error creating user:', err);
                        console.error('Database error details:', err.message);
                        return res.status(500).json({ 'error': 'cannot add user' })
                    })
            }
        ], function (newUser) {
            if (newUser) {
                //return res.status(200).json({ 'msg': 'ok' })
                return res.status(201).json({
                    'userId': newUser.id
                })
            } else {
                //return res.status(404).json({ 'error': 'error' })
                console.error('Error creating user:', err);
                return res.status(500).json({
                    'error': 'cannot add user'
                })
            }
        })

        // TODO verify pseudo lenght, mail regex, password etc.

        /* models.User.findOne({
            attributes: ['email'],
            where: { email: email }
        })
            .then(function (userFound) {
                console.log('User found:', userFound);
                if (!userFound) {

                    bcrypt.hash(password, 5, function (err, bcryptedPassword) {
                        if (err) {
                            console.error('Error hashing password:', err); // Ajoutez ce log en cas d'erreur de hachage
                            return res.status(500).json({ 'error': 'cannot hash password' });
                        }
                        let newUser = models.User.create({
                            email: email,
                            username: username,
                            password: bcryptedPassword,
                            bio: bio,
                            isAdmin: 0
                        })
                            .then(function (newUser) {

                                return res.status(201).json({
                                    'userId': newUser.id
                                })
                            })
                            .catch(function (err) {
                                console.error('Error creating user:', err);
                                return res.status(500).json({ 'error': 'cannot add user' })
                            })
                    })
                } else {
                    return res.status(409).json({ 'error': 'user already exist' })
                }
            })
            .catch(function (err) {
                console.error('Error verifying user:', err);
                return res.status(500).json({ 'error': 'unable to verify user' })
            }) */
    },
    login: function (req, res) {
        //Params
        let email = req.body.email
        let password = req.body.password

        if (email === null || password === null) {
            return res.status(400).json({ 'error': 'missing parameters' })
        }

        // TODO verify mail regex & password lenght
        /* models.User.findOne({
            attributes: ['id', 'email', 'password'],
            where: { email: email }
        })
            .then(function (userFound) {
                console.log('User found:', userFound);
                if (userFound) {

                    bcrypt.compare(password, userFound.password, function (errBycrypt, resBycrypt) {
                        if (errBycrypt) {
                            console.error('Error comparing passwords:', errBycrypt); // Ajoutez ce log en cas d'erreur de comparaison des mots de passe
                            return res.status(500).json({ 'error': 'unable to compare passwords' });
                        }

                        if (resBycrypt) {
                            if (errBycrypt) {
                                console.error('Error comparing passwords:', errBycrypt); // Ajoutez ce log en cas d'erreur de comparaison des mots de passe
                                return res.status(500).json({ 'error': 'unable to compare passwords' });
                            }
                            return res.status(200).json({
                                'userId': userFound.id,
                                'token': jwtUtils.generateTokenForUser(userFound)
                            })
                        } else {
                            return res.status(403).json({ 'error': 'invalid password' })
                        }
                    })
                } else {
                    return res.status(404).json({ 'error': 'user not exist in DB' })
                }
            })
            .catch(function (err) {
                console.error('Error verifying user:', err);
                return res.status(500).json({ 'error': 'unable to verify user' })
            }) */
        asyncLib.waterfall([
            function (done) {
                models.User.findOne({
                    where: { email: email }
                })
                    .then(function (userFound) {
                        done(null, userFound);
                    })
                    .catch(function (err) {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },
            function (userFound, done) {
                if (userFound) {
                    bcrypt.compare(password, userFound.password, function (errBycrypt, resBycrypt) {
                        done(null, userFound, resBycrypt);
                    });
                } else {
                    return res.status(404).json({ 'error': 'user not exist in DB' });
                }
            },
            function (userFound, resBycrypt, done) {
                if (resBycrypt) {
                    done(userFound);
                } else {
                    return res.status(403).json({ 'error': 'invalid password' });
                }
            }
        ], function (userFound) {
            if (userFound) {
                return res.status(200).json({
                    'userId': userFound.id,
                    'token': jwtUtils.generateTokenForUser(userFound)
                });
            } else {
                return res.status(500).json({ 'error': 'cannot log on user' });
            }
        });
    },
    getUserProfile: function (req, res) {
        //Getting auth header
        let headerAuth = req.headers['authorization']
        if (!headerAuth) {
            return res.status(401).json({ 'error': 'missing authorization header' })
        }
        let userId = jwtUtils.getUserId(headerAuth)

        if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' })

        models.User.findOne({
            attributes: ['id', 'email', 'username', 'bio'],
            where: { id: userId }
        }).then(function (user) {
            if (user) {
                res.status(201).json(user)
            } else {
                res.status(404).json({ 'error': 'user not found' })
            }
        }).catch(function (err) {
            res.status(500).json({ 'error': 'cannot fetch user' })
        })
    },
    updateUserProfile: function (req, res) {
        // Getting auth header
        let headerAuth = req.headers['authorization'];
        let userId = jwtUtils.getUserId(headerAuth);

        // Params
        let bio = req.body.bio;

        asyncLib.waterfall([
            function (done) {
                models.User.findOne({
                    attributes: ['id', 'bio'],
                    where: { id: userId }
                }).then(function (userFound) {
                    done(null, userFound);
                })
                    .catch(function (err) {
                        return res.status(500).json({ 'error': 'unable to verify user' });
                    });
            },
            function (userFound, done) {
                if (userFound) {
                    userFound.update({
                        bio: (bio ? bio : userFound.bio)
                    }).then(function () {
                        done(userFound);
                    }).catch(function (err) {
                        res.status(500).json({ 'error': 'cannot update user' });
                    });
                } else {
                    res.status(404).json({ 'error': 'user not found' });
                }
            },
        ], function (userFound) {
            if (userFound) {
                return res.status(201).json(userFound);
            } else {
                return res.status(500).json({ 'error': 'cannot update user profile' });
            }
        })
    }
}
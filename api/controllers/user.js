const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user')

exports.user_signup = (req, res, next) =>{
    User.find({email: req.body.email})
    .exec() 
    .then(user=>{
        if (user.length>=1) {
            return res.status(422).json({
                message: 'Mail exists'
            });

        } else{
            bcrypt.hash(req.body.password, 10, (err, hash)=>{
                if(err){
                    return res.status(500).json({
                        error: err,
                        end: hash
                    });
                }   else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    user
                        .save()
                        .then(result =>{
                            console.log(result)
                            res.status(201).json({
                                message: 'User created'
                            })
                        })
                        .catch(err =>{
                            console.log(err);
                            console.log("dsds")
                            res.status(500).json({
                                error: err
                            })
                        });
                }
            })
        }
    })


}

exports.user_login = (req, res, next)=>{
    User.findOne({email: req.body.email}).exec()
    .then(user => {
        if(user) {
            // jest user o tym mailu, sprawdzam hasło
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if(err) {
                    return res.status(401).json({message:"Brak autoryzacji"});
                }
                if(result) {
                    const token = jwt.sign({
                        email: user.email,
                        userId: user._id
                    }, "secret",
                    {
                        expiresIn: "10h"
                    })
                    return res.status(200).json({message: "Autoryzacja", token: token});
                }
                return res.status(404).json({message:"Brak autoryzacji"});
            })

        } else {
            res.status(401).json({message:"Brak autoryzacji"});
        }
    })
    .catch(err => res.status(500).json({error: err}));
}

exports.user_delete =  (req, res, next)=> {
    User.findByIdAndRemove(req.params.userId).exec()
    .then(result => {
        res.status(200).json({message: "Użytkownik usunięty"});
    })
    .catch(err => res.status(500).json({error: err}));
}
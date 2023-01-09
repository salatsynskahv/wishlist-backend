const express = require("express");
const mongoose = require("mongoose");
const passport = require('passport');
const cookieSession = require('cookie-session');
const Wishlist = require("./src/model/wishlist")
require("dotenv").config();
require('./src/passport-setup')

const app = express();
const cors = require('cors');
const User = require("./src/model/user");
app.use(express.json())
app.use(cors({}))

const port = process.env.PORT || 3001;
const uri = process.env.MONGODB_CONNECTION_STRING;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB database connection established successfully")
})

//Setting up cookies
app.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
}))

//Logged In Middleware
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
}

//Passport Initialized
app.use(passport.initialize());

//Setting Up Session
app.use(passport.session())

app.get('/', (req, res) => {
    res.render('pages/index')
})

app.get('/failed', (req, res) => res.send('You Failed to log in!'))

app.get('/good', (req, res) => {
    console.log(req.user.photos[0].value)
    // res.render('pages/profile.ejs',{
    //     name:req.user.displayName,
    //     pic:req.user._json.picture,
    //     email:req.user.emails[0].value,
    //     profile: "google"
    // })
})

app.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

app.get('/google/callback',
    passport.authenticate('google',
        {failureRedirect: '/failed'}),
    (req, res) => {
        res.redirect('/good');
    })

app.get('/profile', (req, res) => {
    console.log("----->", req.user)
    res.render('pages/profile', {
        profile: "facebook",
        name: req.user.displayName,
        pic: req.user.photos[0].value,
        email: req.user.emails[0].value // get the user out of session and pass to template
    });
})

app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

app.get('/auth/linkedin',
    passport.authenticate('linkedin', {
            scope: ['r_emailaddress', 'r_liteprofile']
        }
    ));

app.get('/auth/twitter',
    passport.authenticate('twitter', {
            scope: 'email'
        }
    ));

app.get('/facebook/callback',
    passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }
    ));

app.get('/linkedin/callback',
    passport.authenticate('linkedin', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }
    ));


app.get('/twitter/callback',
    passport.authenticate('linkedin', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }
    ));

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.get("/wishlist", async (request, response) => {
    await Wishlist.find({}, (err, result) => {
        // console.log("get request in")
        response.send(result)
        // console.log("result " + result.data)
    })
})
app.get("/wishlist/:id", async (request, response) => {
    console.log('request.params.id: ' + request.params.id)
    await Wishlist.findOne({_id: new mongoose.Types.ObjectId(request.params.id)}, (err, result) => {
        console.log("get request in")
        response.send(result)
        console.log("result " + result)
    }).clone()
})

app.get("/wishlists/:userEmail", (request, response) => {
    console.log('/wishlists/:userEmail request.params.id: ' + request.params.userEmail)
    Wishlist.find({user: request.params.userEmail}, (err, result) => {
        console.log("get request in")
        response.send(result)
        console.log("result " + result)
    }).clone().catch(function (err) {
        console.log(err)
    })
})

app.delete("/wishlist/:id", async (request, response) => {
    console.log("delete wishlist by id");
    await Wishlist.findByIdAndDelete(request.params.id).then(
        (result) => {
            console.log(result)
            response.send(result)
        }
    )
})

app.post("/wishlist", async (req, res) => {
    try {
        console.log("req:body", req.body);
        const newWishlist = req.body
        // newWishlist._id = new mongoose.Types.ObjectId()
        Wishlist.modifyWishlistSchema(req.body.fields)
        await Wishlist.create(newWishlist)
        res.send({_id: newWishlist._id})
    } catch (err) {
        console.log("error", err)
    }

})

app.put("/wishlist", async (req, res) => {
    console.log("put wishlist: " + JSON.stringify(req.body));
    const filter = {_id: req.body._id}
    Wishlist.modifyWishlistSchema(req.body.fields)
    Wishlist.findOneAndUpdate(filter,
        {
            fields: req.body.fields,
            content: req.body.content
        },
        {new: true}
    )
        .then(
            result => {
                console.log("found: " + JSON.stringify(result));
                res.send({message: `wishlist  updated`})
                console.log("after put wishlist: " + JSON.stringify(result));
            }
        )
        .catch(
            err => {
                console.log(err);
            }
        )
})
app.get('/user/:email', async (request, response) => {
    try {
        const user = await User.findOne({email: request.params.email});
        console.log(`found user: ${JSON.stringify(user)}`);
        response.send(user)
    } catch (e) {
        console.log(e)
    }
})

app.post("/user", async (request, response) => {
    try {
        console.log("req:body", request.body);
        await User.create(request.body);
    } catch (err) {
        console.log("error", err)
    }
})

app.patch('/user', async (request, response) => {
    try {
        console.log("req:body", request.body);
        const updateItem = request.body;
        User.findOne({email: updateItem.currentUserEmail}).then(
            doc => {
                if (doc['friend_ids']) {
                    doc['friend_ids'].push(updateItem.newFriend.email)
                } else {
                    doc['friend_ids'] = [updateItem.newFriend.email]
                }
                console.log("doc: " + JSON.stringify(doc));
                doc.save();
                response.send({addedFriend: updateItem.newFriend.email});
            },
            err => {
                console.log(err)
            })

    } catch (err) {
        console.log("err", err)
    }
})
//:todo return list of wishlists of each friend
app.get("/friends", async (req, res) => {
    try {
        const searchValue = req.query.email;
        console.log("req.query.email : " + searchValue)
        User.find({email: {$regex: searchValue}}).then((result => {
                console.log('find friends' + result)
                res.send(result)
            })
        )

    } catch (err) {
        console.log("/FRIENDS APP GET", err)
    }
})

app.listen(port, () => {
    console.log(`App listening at localhost:${port}`);
});
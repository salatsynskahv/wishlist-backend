// const passport = require('passport');
// require("dotenv").config();
//
// const GoogleStrategy = require('passport-google-oauth2').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
// const User = require("./model/user")
//
// // used to serialize the user for the session
// passport.serializeUser(function (user, done) {
//     done(null, user);
// });
//
// // used to deserialize the user
// passport.deserializeUser(function (user, done) {
//     done(null, user);
// });
//
// //Google strategy
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:3001/google/callback",
//     passReqToCallback: true
// }, (request, accessToken, refreshToken, profile, done) => {
//     console.log(profile)
//     User.findOrCreate(
//         {
//             googleId: profile.id
//         },
//         function (err, user){
//             return done(err, user)
//         }
//         )
// }));
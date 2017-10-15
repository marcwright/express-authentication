var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// at the very top, require the passport-facebook strategy
var FacebookStrategy = require('passport-facebook').Strategy;
var db = require('../models');

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.user.findById(id).then(function(user) {
    cb(null, user);
  }).catch(cb);
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, cb) {
  db.user.find({
    where: { email: email }
  }).then(function(user) {
    if (!user || !user.validPassword(password)) {
      cb(null, false);
    } else {
      cb(null, user);
    }
  }).catch(cb);
}));

/*
 * Below the LocalStrategy, setup passport to use the FacebookStrategy.
 * We'll need to pass along the app id, app secret, and callback URL from
 * environment variables. We'll also want to define the fields we're
 * getting from Facebook, and enabling proof, which tells Facebook to
 * check the client secret in order to verify our server
 */
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.BASE_URL + '/auth/facebook/callback',
  profileFields: ['id', 'email', 'displayName', 'picture'],
  enableProof: true
}, function(accessToken, refreshToken, profile, cb) {
  console.log(profile.photos[0].value)

  /*
   * This function we're inside will be called once our user is authenticated
   * by Facebook. We can access our token and profile, as well as run a callback
   * function that accepts an error and a user
   */
  //  var profile = profile;
  //  var accessToken = accessToken;
  // pull the email from the user's Facebook profile, if it exists
  var email = profile.emails ? profile.emails[0].value : null;
  var pic = profile.photos ? profile.photos[0].value : null;
  // console.log('accessToken', accessToken);

  // see if the user exists in the database by email
  db.user.find({
    where: { email: email },
  }).then(function(existingUser) {
    // console.log("existingUser", existingUser);
    // if the user with a valid email exists already, link their existing account with their Facebook.
    if (existingUser && email) {
      existingUser.update({
        facebookId: profile.id,
        facebookToken: accessToken,
        facebookPic: pic
      }).then(function(updatedUser) {
        // console.log("updatedUser line 70",updatedUser);
        cb(null, updatedUser);
      }).catch(cb);
    } else {
      // if the user doesn't exist, findOrCreate the user on the user's Facebook id
      db.user.findOrCreate({
        // where: { facebookId: profile.id },
        where: { facebookId: profile.id },
        defaults: {
          facebookToken: accessToken,
          name: profile.displayName,
          email: email,
          facebookPic: pic
        }
      }).spread(function(user, created) {
        // console.log("created User line 83", user);
        // if the user is created, we're done
        if (created) {
          return cb(null, user);
        } else {
          // if the user wasn't created, they exist. Update their access token
          user.facebookToken = accessToken;
          user.facebookPic = pic;
          user.save().then(function() {
            cb(null, user);
          }).catch(cb);
        }
      }).catch(cb);
    }
  }).catch(cb)
}));



module.exports = passport;

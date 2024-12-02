const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../Model/userModel");


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/user/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log({ profile });
      const user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        console.log('user not found')
      }
      return null, profile;
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;

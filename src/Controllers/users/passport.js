const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../Model/userModel"); // Ensure this path is correct

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/user/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log({ profile });

        // Find user by email
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // If user doesn't exist, create a new user
          user = await User.create({
            firstname: profile.name.givenName || "Google",
            lastname: profile.name.familyName || "User",
            email: profile.emails[0].value,
            userImage: profile.photos[0].value,
          });
          console.log("New user created:", user);
        }

        // Pass user data to done
        done(null, user);
      } catch (error) {
        console.error("Error during Google Strategy:", error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id); // Serialize the user ID into the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Find user by ID during deserialization
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

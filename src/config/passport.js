import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../models/user.js';

// konfigurasi passport js

const configurePassport = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
          try {
            const user = await User.findOne({ username });
      
            if (!user) {
              return done(null, false, { message: 'Incorrect username or password.' });
            }
      
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
              return done(null, false, { message: 'Incorrect username or password.' });
            }
      
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        })
      );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

export default configurePassport;

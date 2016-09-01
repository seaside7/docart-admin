import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

function localAuthenticate(User, email, password, done) {
  User.findOne({
    email: email.toLowerCase()
  }).populate('supplier customer').exec()
    .then(user => {
      if (!user) {
        return done(null, false, {
          status: 1, message: 'Your email or password is not correct. Please try again!'
        });
      }
      user.authenticate(password, function(authError, authenticated) {
        if (!user.active && user.role !== 'admin') {
          return done(null, false, { status: 2, message: 'You need to activate your account, please check your email!'} );
        }
        if (authError) {
          return done(authError);
        }
        if (!authenticated) {
          return done(null, false, { status: 1, message: 'Your email or password is not correct. Please try again!' });
        } else {
          return done(null, {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            supplier: user.supplier
          });
        }
      });
    })
    .catch(err => done(err));
}

export function setup(User, config) {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password' // this is the virtual field on the model
  }, function(email, password, done) {
    return localAuthenticate(User, email, password, done);
  }));
}

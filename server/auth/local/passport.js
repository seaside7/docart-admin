import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import shared from '../../config/environment/shared';

function localAuthenticate(User, email, password, role, done) {
  User.findOne({
    email: email.toLowerCase(),
    role: role
  }).populate('supplier customer').exec()
    .then(user => {
      if (!user) {
        return done(null, false, {
          status: shared.status.ERROR, message: 'Your email or password is not correct. Please try again!'
        });
      }
      user.authenticate(password, function(authError, authenticated) {
        if (!user.active && user.role !== shared.userRole.admin) {
          return done(null, false, { status: shared.status.INACTIVE, message: 'You need to activate your account, please check your email!'} );
        }
        if (authError) {
          return done(authError);
        }
        if (!authenticated) {
          return done(null, false, { status: shared.status.ERROR, message: 'Your email or password is not correct. Please try again!' });
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
    passwordField: 'password', // this is the virtual field on the model,
    passReqToCallback: true
  }, function(req, email, password, done) {
    return localAuthenticate(User, email, password, req.role, done);
  }));
}

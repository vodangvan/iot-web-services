var passport = require('passport'),
    passportJWT = require('passport-jwt'),
    env       = process.env.NODE_ENV || 'development',
    config    = require('../config/config.json')[env],
    extractJwt = passportJWT.ExtractJwt,
    strategyJwt = passportJWT.Strategy;

var params = {
    secretOrKey: config.secretOrKey,
    jwtFromRequest: extractJwt.fromAuthHeader()
};

var jwtStrategy = new strategyJwt(params, function (data, done) {
    if (data.exp <= Date.now()) {
        return done("Token expired");
    }else if (data.payload.id == config.payloadID){
        return done(null, {id: data.payload.id});
    } else {
        return done("Not access");
    }
});

passport.use('jwt', jwtStrategy);

module.exports.isJwtAuthenticated = passport.authenticate('jwt', {session: false});
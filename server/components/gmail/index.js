/**
 * Gmail Send
 */

'use strict';

import config from './../../config/environment';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import Gmail from './gmail.model';
var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');

function CustomError(message, extra) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.extra = extra;
}

require('util').inherits(CustomError, Error);

/////////// Gmail db related ////////////////////////
function handleEntityNotFound(res) {
    return function (entity) {
        if (!entity) {
            res.status(404).end();
            return null;
        }
        return entity;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        console.error(err);
        res.status(statusCode).send(err);
    };
}


/*user: 'info@do-cart.com',
                clientId: '1046017579432-ujfbc7utodcq110i3qsbv43tsh73gsf6.apps.googleusercontent.com',
                clientSecret: 'NShK1XtpAe8a3GdVpIM6l6r0',
                refreshToken: 'NShK1XtpAe8a3GdVpIM6l6r0',
                accessToken: 'ya29.Ci9TA-Hgzju62Al3fGRLLcK3NyHTcLQyqrLb7GYD1aaJZZKKe6KmtH6zPrMcfsN82w'
                */
function createGmail(user, refreshToken, accessToken, timeout, cb) {
    var gmail = {
        user: user,
        refreshToken: refreshToken,
        accessToken: accessToken,
        timeout: timeout
    }
    return Gmail.create(gmail)
        .then(gmail => {
            if (cb) {
                cb(null, gmail);
            }
        })
        .catch(err => {
            console.error(err);
            if (cb) {
                cb(err, null);
            }
        });
}

function updateGmail(user, refreshToken, accessToken, timeout, cb) {
    return Gmail.findOne({ user: user }).exec()
        .then(gmail => {
            if (!gmail) {
                if (cb) {
                    cb(new Error('Gmail data not found'), null);
                }
                return;
            }
            else {

                console.log('-----------------------------');
                console.log('Found current gmail data: ');
                console.log(gmail)
                console.log('-----------------------------');

                gmail.user = user;
                gmail.refreshToken = refreshToken;
                gmail.accessToken = accessToken;
                gmail.timeout = timeout;
                return gmail.save()
                    .then(updatedGmail => {
                        console.log('-----------------------------');
                        console.log('saving new gmail data: ');
                        console.log(gmail)
                        console.log('-----------------------------');
                        if (cb) {
                            cb(null, updatedGmail);
                        }
                    })
                    .catch(err => {
                        if (cb) {
                            cb(err, null);
                        }
                    })
            }
        })
        .catch(err => {
            if (cb) {
                cb(err, null);
            }
        });
}

function getGmailApi(user, cb) {
    return Gmail.findOne({ user: user }).exec()
        .then(gmail => {
            if (!gmail) {
                return createGmail(config.GmailApi.user, config.GmailApi.refreshToken, config.GmailApi.accessToken, 0, cb);
            }
            else {
                if (cb) {
                    cb(null, gmail);
                }
            }
        })
        .catch(err => {
            console.error(err);
            if (cb) {
                cb(err, null);
            }
        });
}


/////////// Gmail Send related /////////////////////

var gmailSend = require('gmail-send')({
    user: config.mailServer.username,
    pass: config.mailServer.password
});

function sendMail(to, subject, body, cb) {
    gmailSend({
        to: to,
        subject: subject,
        text: body
    }, cb);
}

function sendHtmlMail(to, subject, html, cb) {
    gmailSend({
        to: to,
        subject: subject,
        from: 'donotreply@gmail.com',
        html: html
    }, cb);
}

function sendGmail(from, to, subject, text, html, cb) {

    var generator = require('xoauth2').createXOAuth2Generator({
        user: config.GmailApi.user,
        clientId: config.GmailApi.clientId,
        clientSecret: config.GmailApi.clientSecret,
        refreshToken: config.GmailApi.refreshToken
    });

    // listen for token updates
    // you probably want to store these to a db
    generator.on('token', function (token) {
        console.log('New token for %s: %s', token.user, token.accessToken);
    });

    // login
    var transporter = nodemailer.createTransport(({
        service: 'gmail',
        auth: {
            xoauth2: generator
        }
    }));

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: from, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plaintext body
        html: html // html body
    };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            var invalidRequest = error.message;
            return;
        }
        console.log('Message sent: ' + info.response);

        if (cb) {
            cb(null, info);
        }
    });
    /*getGmailApi(config.GmailApi.user, (err, gmail) => {
        if (err) {
            if (cb) {
                cb(err, null);
            }
            return;
        }

        console.log('---------------------------------');
        console.log('Sending Gmail: ');
        console.log(gmail);
        console.log('---------------------------------');
        var xoauth2Gen = xoauth2.createXOAuth2Generator({
            user: gmail.user,
            clientId: gmail.clientId,
            clientSecret: gmail.clientSecret,
            refreshToken: gmail.refreshToken,
            accessToken: gmail.accessToken
        })

        // listen for token updates (if refreshToken is set)
        // you probably want to store these to a db
        xoauth2Gen.on('token', function (token) {
            console.log('################# New token for %s: %s', token.user, token.accessToken);
            updateGmail(config.GmailApi.user, config.GmailApi.refreshToken, token.accessToken, token.timeout, (err, data) => {
                sendGmail(from, to, subject, text, html, cb);
            });
        });

        // login
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                xoauth2: xoauth2Gen
            }
        });

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: from, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            text: text, // plaintext body
            html: html // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                var invalidRequest = error.message;
                return;
            }
            console.log('Message sent: ' + info.response);

            if (cb) {
                cb(null, info);
            }
        });
    })*/
}

function getGmailNewToken(generator, from, to, subject, text, html, cb) {
    generator.getToken((err, token, accessToken) => {
        if (err) {
            var invalidRequest = err.message;
            if (err.message === 'invalid_request') {
                console.log('==> Getting new Token')
                getGmailNewToken(cb);
            }
        }
        else {
            console.log('-----------------------------');
            console.log('Get New Token: ' + token);
            console.log('Get New Access Token: ' + accessToken);
            console.log('-----------------------------');
            updateGmail(config.GmailApi.user, config.GmailApi.refreshToken, accessToken, 0, (err, data) => {
                if (err) {
                    console.error(err);
                    if (cb) {
                        cb(err, null);
                    }
                }
                else {
                    sendGmail(from, to, subject, text, html, cb);
                }
            });
        }
    })
}

module.exports = {
    sendMail: sendMail,
    sendHtmlMail: sendHtmlMail,
    sendGmail: sendGmail
}
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
                return createGmail(config.GmailApi.user, config.GmailApi.refreshToken, config.GmailApi.accessToken, 0, cb);
            }
            else {
                gmail.user = user;
                gmail.refreshToken = refreshToken;
                gmail.accessToken = accessToken;
                gmail.timeout = timeout;

                return gmail.save()
                    .then(updatedGmail => {
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
    
    getGmailApi(config.GmailApi.user, (err, gmail) => {
        if (err) {
            if (cb) {
                cb(err, null);
            }
            return;
        }
        
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
            console.log('# New token for %s: %s', token.user, token.accessToken);
            updateGmail(token.user, config.GmailApi.refreshToken, token.accessToken, token.timeout);
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
                if (cb) {
                    cb(error, null);
                }
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);

            if (cb) {
                cb(null, info);
            }
        });
    })
}

module.exports = {
    sendMail: sendMail,
    sendHtmlMail: sendHtmlMail,
    sendGmail: sendGmail
}
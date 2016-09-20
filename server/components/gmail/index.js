/**
 * Gmail Send
 */

'use strict';

import config from './../../config/environment';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import Gmail from './gmail.model';
import ejs from 'ejs';

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

function sendHtmlMail(to, subject, htmlPath, htmlFile, data, cb) {
    ejs.renderFile(path.join(htmlPath, htmlFile), data, {}, (err, html) => {
        if (err) {
            console.log(err);
            return;
            }

        sendGmail('info@do-cart.com', to, subject, '', html, cb);
        
    })
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
    
    console.info('=> Sending Gmail to %s', to);

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            var invalidRequest = error.message;
            if (cb) {
                cb(error, null, html);
            }
            return;
        }
        console.log('Message sent: ' + info.response);

        if (cb) {
            cb(null, info, html);
        }
    });
}


module.exports = {
    sendHtmlMail: sendHtmlMail,
    sendGmail: sendGmail
}
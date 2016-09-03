/**
 * Gmail Send
 */

'use strict';

import config from './../../config/environment';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';

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

module.exports = {
    sendMail: sendMail,
    sendHtmlMail: sendHtmlMail
}
/**
 * Express configuration
 */

'use strict';

import express from 'express';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import compression from 'compression';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import errorHandler from 'errorhandler';
import path from 'path';
import lusca from 'lusca';
import config from './environment';
import passport from 'passport';
import session from 'express-session';
import multiparty from 'connect-multiparty';
import connectMongo from 'connect-mongo';
import mongoose from 'mongoose';
import appRoot from 'app-root-path';
import AWS from 'aws-sdk';
import s3 from '../components/s3bucket';
import multer from 'multer';
import multerS3 from 'multer-s3';
import sha1 from 'sha1';
import moment from 'moment';


AWS.config.loadFromPath(config.s3.Credentials);
var S3 = new AWS.S3();

var MongoStore = connectMongo(session);

export default function (app) {
    var env = app.get('env');

    if (env === 'development' || env === 'test') {
        app.use(express.static(path.join(config.root, '.tmp')));
    }

    if (env === 'production') {
        app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
    }

    app.set('appPath', path.join(config.root, 'client'));
    app.use(express.static(app.get('appPath')));
    app.use(morgan('dev'));

    app.set('views', config.root + '/server/views');
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(compression());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(passport.initialize());
    app.use(multer({
        storage: multerS3({
            s3: S3,
            bucket: config.s3.Bucket,
            acl: 'public-read',
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                var extName = path.extname(file.originalname);
                var filename = sha1(file.originalname + moment().format('DD-MM-YYYY HH:mm:ss')) + extName
                console.log("S3 Upload: " + filename);
                cb(null, filename);
            }
        })
    }).fields([
        { name: 'file', maxCount: 1 },
        { name: 'images', maxCount: 20 }
    ]));

    /* We don't store file on uploadDir anymore
    app.use(multiparty({
      uploadDir: appRoot.resolve(config.uploadsPath)
    }));
    app.use(s3.s3FileUploader({
      s3Bucket: config.s3.Bucket,
      s3Credentials: config.s3.Credentials
    }));*/

    // Persist sessions with MongoStore / sequelizeStore
    // We need to enable sessions for passport-twitter because it's an
    // oauth 1.0 strategy, and Lusca depends on sessions
    app.use(session({
        secret: config.secrets.session,
        saveUninitialized: true,
        resave: false,
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            db: 'docart-admin'
        })
    }));

    /**
     * Lusca - express server security
     * https://github.com/krakenjs/lusca
     */
    if (env !== 'test' && !process.env.SAUCE_USERNAME && config.useCsrf) {
        app.use(lusca({
            csrf: {
                angular: true
            },
            xframe: 'SAMEORIGIN',
            hsts: {
                maxAge: 31536000, //1 year, in seconds
                includeSubDomains: true,
                preload: true
            },
            xssProtection: true
        }));
    }

    if ('development' === env) {
        app.use(require('connect-livereload')({
            ignore: [
                /^\/api\/(.*)/,
                /\.js(\?.*)?$/, /\.css(\?.*)?$/, /\.svg(\?.*)?$/, /\.ico(\?.*)?$/, /\.woff(\?.*)?$/,
                /\.png(\?.*)?$/, /\.jpg(\?.*)?$/, /\.jpeg(\?.*)?$/, /\.gif(\?.*)?$/, /\.pdf(\?.*)?$/
            ]
        }));
    }

    if ('development' === env || 'test' === env) {
        app.use(errorHandler()); // Error handler - has to be last
    }
}

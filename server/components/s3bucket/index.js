/**
 * S3 Bucket
 */

'use strict';

import _ from 'lodash';
import env from './../../config/environment';
import AWS from 'aws-sdk';
import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';

function s3FileUploader(params) {

    AWS.config.loadFromPath(params.s3Credentials);
    var S3 = new AWS.S3();
    return uploader;

    function uploader(req, res, next) {

        var contentType = req.headers['content-type']

        if (!contentType || contentType.indexOf('multipart/form-data') !== 0) {
            return next();
        }

        if (req.files) {

            if (!req.files.file) {
                return next();
            }

            var uploadedFilePath = req.files.file.path;
            var fileName = path.basename(uploadedFilePath);

            var s3Params = {
                Bucket: params.s3Bucket,
                Key: fileName,
                ACL: 'public-read',
                Body: fs.createReadStream(uploadedFilePath)
            };

            S3.putObject(s3Params, function (err, data) {
                if (err) {
                    throw err;
                }
                else {
                    var bucketPath = path.join('http://' + AWS.config.endpoint, params.s3Bucket);
                    var fullPath = path.join(bucketPath, fileName);

                    req.s3 = {
                        path: fullPath,
                        fileName: fileName
                    }

                    console.info('s3FileUploader: Uploaded to S3 => ' + req.s3.path)
                    fsExtra.remove(uploadedFilePath);

                    next();
                }
            });
        }
        else {
            next();
        }
    }
}

function s3FileRemove(credentials, bucket, fileNames, cb) {
    AWS.config.loadFromPath(credentials);
    var S3 = new AWS.S3();

    var objs = [];
    fileNames.forEach((f) => {
        objs.push({
            Key: f
        });
    });
    var params = {
        Bucket: bucket,
        Delete: { // required
            Objects: objs
        }
    }

    S3.deleteObjects(params, (err, data) => {
        if (cb) {
            if (!err) {
                console.info('s3FileRemove: Removed file on bucket => ' + JSON.stringify(fileNames));
            }
            cb(err, data);
        }
    })
}


module.exports = {
    s3FileUploader: s3FileUploader,
    s3FileRemove: s3FileRemove
}
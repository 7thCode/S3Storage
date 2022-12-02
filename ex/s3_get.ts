// aws configure --profile wasabi
// aws s3 ls --endpoint-url=https://s3.wasabisys.com

// ex. create basket
// aws s3 mb s3://[NEW_BASKETNAME] --endpoint-url=https://s3.ap-northeast-2.wasabisys.com

import {AWSError} from "aws-sdk";

const fs = require('fs');

const AWS = require('aws-sdk');

AWS.config.loadFromPath('./rootkey.json');
AWS.config.update({region: 'ap-northeast-2'});
const ep = new AWS.Endpoint('s3.wasabisys.com');
const s3 = new AWS.S3({endpoint: ep});

const get = (bucket: any, key: string, callback: (error: any, data: any) => void) => {
    const params = {
        Bucket: bucket,
        Key: key,
    };
    s3.getObject(params, callback);
}

get('7thcode', 'backup/qtie.mp4',
    (err: any, data: any) => {
        if (err) {
            console.log(err);
            return;
        }

        const writer = fs.createWriteStream('/Users/oda/Desktop/qtie2.mp4');
        writer.on("finish", () => {
            console.log("success");
        })

        writer.write(data.Body);
        writer.end();
    });

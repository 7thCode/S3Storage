// aws configure --profile wasabi
// aws s3 ls --endpoint-url=https://s3.wasabisys.com

import {AWSError} from "aws-sdk";

const AWS = require('aws-sdk');

AWS.config.loadFromPath('./rootkey.json');
AWS.config.update({region: 'ap-northeast-2'});
const ep = new AWS.Endpoint('s3.wasabisys.com');
const s3 = new AWS.S3({endpoint: ep});

const remove = (bucket: any, key: string, callback: (error: any, data: any) => void) => {

  const params = {
	  Bucket: bucket,
	  Key: key
  };

   s3.deleteObject(params, callback);
};

remove('7thcode', 'backup/qtie.mp4', (error) => {});

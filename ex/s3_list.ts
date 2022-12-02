// aws configure --profile wasabi
// aws s3 ls --endpoint-url=https://s3.wasabisys.com

// ex. create basket
// aws s3 mb s3://[NEW_BASKETNAME] --endpoint-url=https://s3.ap-northeast-2.wasabisys.com

import {AWSError} from "aws-sdk";

const AWS = require('aws-sdk');

AWS.config.loadFromPath('./rootkey.json');
AWS.config.update({region: 'ap-northeast-2'});
const ep = new AWS.Endpoint('s3.wasabisys.com');
const s3 = new AWS.S3({endpoint: ep});

const list = (bucket: any, callback:(error:any, data:any) => void) => {

  const params = {
	  Bucket: bucket
  };

  s3.listObjects(params, callback);
};

list('7thcode', (error:any, data:any) => {
	console.log(data);
});

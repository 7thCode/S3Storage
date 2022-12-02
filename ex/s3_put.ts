
import {AWSError} from "aws-sdk";

const fs = require('fs');
const crypto = require('crypto');
const AWS = require('aws-sdk');

AWS.config.loadFromPath('./rootkey.json');
AWS.config.update({region: 'ap-northeast-2'});
const ep = new AWS.Endpoint('s3.wasabisys.com');
const s3 = new AWS.S3({endpoint: ep});

/*
AWS.config.getCredentials((error:any) => {
  if (error) {
	  console.log(error);
  }else {
	  console.log("Success");
  }
});
*/

const md5sum = (data: any) => {
  const hash = crypto.createHash('md5')
	  .update(data)
	  .digest('base64');
  return hash;
};

const put = (bucket: any, key: string, fileName: string, callback: (error: any, data: any) => void) => {

  const fileData = fs.readFileSync(fileName);
  const contentMD5 = md5sum(fileData);
  const params = {
	  Bucket: bucket,
	  Key: key,
	  Body: fileData,
	  ContentMD5: contentMD5,
	  ContentType: 'video/mp4',
	  ACL: 'public-read'
  };

   s3.putObject(params, callback);
};

put('7thcode', 'backup/qtie.mp4', '/Users/oda/Desktop/qtie.mp4', (error) => {

});

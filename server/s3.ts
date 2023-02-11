// aws configure --profile wasabi
// aws s3 ls --endpoint-url=https://s3.wasabisys.com

const fs = require('fs');
const _crypto = require('crypto');
const _AWS = require('aws-sdk');


class S3Storage {

    public client: any;
    public config: any;
    public bucket: string;

    public static acls = {
        private: "private",                         // 所有者に FULL_CONTROL のみ
        public_read: "public-read",                 // privateの許可 +「AllUsers に READ」
        public_write: "public-read-write",          // privateの許可 +「AllUsers に READ/WRITE」
        aws_read: "aws-exec-read",                  // privateの許可 +「EC2に AMIバンドル(in S3)の READ」
        auth_read: "authenticated-read",            // privateの許可 +「AuthenticatedUsers に READ」
        owner_read: "bucket-owner-read",            // オブジェクト所有者に FULL_CONTROL + バケット所有者にREAD
        owner_full: "bucket-owner-full-control",	// オブジェクト所有者/バケット所有者に FULL_CONTROL
        logw_write: "log-delivery-write"	        // LogDelivery に WRITE および READ_ACP
    };

    constructor(AWS: any, endpoint: string, region: string, bucket: string) {

        //  const credentials = new AWS.Credentials({accessKeyId: 'AKYYYYYYYYYYYYYYYYYY', secretAccessKey: 'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy'});
        //  AWS.config.credentials = credentials;

        AWS.config.loadFromPath('./rootkey.json');

        AWS.config.update({region: region});
        const ep = new AWS.Endpoint(endpoint);
        this.client = new AWS.S3({endpoint: ep});
        this.config = AWS.config
        this.bucket = bucket;
    }

    private md5sum(data: any) {
        const hash = _crypto.createHash('md5')
            .update(data)
            .digest('base64');
        return hash;
    };

    public auth(callback: (error: any) => void): void {
        this.config.getCredentials((error: any) => {
            callback(error);
        });
    }

    public put(key: string, fileData: any, mime: string, ACL: string, callback: (error: any, data: any) => void): void {
        const contentMD5 = this.md5sum(fileData);
        const params = {
            Bucket: this.bucket,
            Key: key,
            Body: fileData,
            ContentMD5: contentMD5,
            ContentType: mime,
            ACL: ACL
        };
        this.client.putObject(params, callback);
    };

    public get(key: string, callback: (error: any, data: any) => void): void {
        const params = {
            Bucket: this.bucket,
            Key: key,
        };
        this.client.getObject(params, callback);
    }

    public list(callback: (error: any, data: any) => void): void {
        const params = {
            Bucket: this.bucket
        };
        this.client.listObjects(params, callback);
    };

    public remove(key: string, callback: (error: any, data: any) => void): void {
        const params = {
            Bucket: this.bucket,
            Key: key
        };
        this.client.deleteObject(params, callback);
    };

}


const s = new S3Storage(_AWS, 's3.wasabisys.com', 'ap-northeast-2', '7thcode');

const chunks: any[] = [];

s.auth((error) => {
    if (!error) {
        s.remove('backup/qtie.mp4', (error) => {
            if (!error) {
                const reader = fs.createReadStream('/Users/oda/Desktop/qtie.mp4');
                reader.on('data', (chunk: Buffer) => {
                    chunks.push(chunk);
                });

                reader.on('end', () => {
                    const fileData = Buffer.concat(chunks);
                    s.put('backup/qtie.mp4', fileData, 'video/mp4', S3Storage.acls.public_read, (error) => {
                        if (!error) {
                            s.list((error: any, data: any) => {
                                if (!error) {
                                    data.Contents.forEach((file: any) => {
                                        console.log(file.Key);
                                    })
                                    s.get('backup/qtie.mp4', (error: any, data: any) => {
                                        if (!error) {
                                            const writer = fs.createWriteStream('/Users/oda/Desktop/qtie2.mp4');
                                            writer.on("finish", () => {
                                                 console.log("end.");
                                           /*     s.remove('backup/qtie.mp4', (error) => {
                                                    if (!error) {
                                                        s.list((error: any, data: any) => {
                                                            if (!error) {
                                                                data.Contents.forEach((file: any) => {
                                                                    console.log(file.Key);
                                                                })
                                                            } else {
                                                                console.log("list " + error.message);
                                                            }
                                                        });
                                                    } else {
                                                        console.log("remove " + error.message);
                                                    }
                                                });*/
                                            })
                                            writer.write(data.Body);
                                            writer.end();
                                        } else {
                                            console.log("get " + error.message);
                                        }
                                    });
                                } else {
                                    console.log("list " + error.message);
                                }
                            });
                        } else {
                            console.log("put " + error.message);
                        }
                    });
                });
            } else {
                console.log("remove " + error.message);
            }
        });
    } else {
        console.log("auth " + error.message);
    }
});




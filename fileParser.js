const formidable = require('formidable');
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client } = require("@aws-sdk/client-s3");
const Transform = require('stream').Transform;

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;

const parseFile = async (req, userId) => {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm({
            maxFileSize: 100 * 1024 * 1024,
            allowEmptyFiles: false
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log("err", err);
            }
        });

        form.on('error', error => {
            reject(error.message)
        })

        form.on('data', data => {
            if (data.name === "successUpload") {
                resolve(data.value);
            }
        })

        form.on('fileBegin', (formName, file) => {

            file.open = async function () {
                this._writeStream = new Transform({
                    transform(chunk, encoding, callback) {
                        callback(null, chunk)
                    }
                })

                this._writeStream.on('error', e => {
                    form.emit('error', e)
                });

                // upload to S3
                new Upload({
                    client: new S3Client({
                        credentials: {
                            accessKeyId,
                            secretAccessKey
                        },
                        region
                    }),
                    params: {
                        ACL: 'public-read',
                        Bucket,
                        Key: `${userId}-profile-picture.jpg`,
                        Body: this._writeStream,
                        CacheControl: 'no-cache',
                    },
                    queueSize: 4, // optional concurrency configuration
                    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
                    leavePartsOnError: false, // optional manually handle dropped parts
                })
                    .done()
                    .then(data => {
                        form.emit('data', { name: "complete", value: data });
                        resolve(data);
                    }).catch((err) => {
                        form.emit('error', err);
                        reject(err);
                    })
            }

            file.end = function (cb) {
                this._writeStream.on('finish', () => {
                    this.emit('end')
                    cb()
                })
                this._writeStream.end()
            }

        })


    })
}

module.exports = parseFile;
'use strict';

//definition library
const aws = require('aws-sdk');
const rekognition = new aws.Rekognition();
const co = require('co');

//difinition variables
const COLLECTION_ID = 'COLLECTION_ID';
const THRESHOLD = 90;

exports.handler = (event, context, callback) => {
  console.log('start function');

  // event params
  console.log(JSON.stringify(event));

  co(function* () {
    // image
    const base64Image = event.base64Image;
    const image = new Buffer(base64Image, 'base64');

    // authentication
    const data = yield searchFacesByImage(image);

    const result = data.FaceMatches.some((element) => {
      return element.Similarity >= THRESHOLD;
    });

    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      message: result ? 'OK' : 'NG'
    };
    return response;
  }).then(onEnd).catch(onError);

  // authentication
  function searchFacesByImage(image) {
    return new Promise((resolve, reject) => {
      const params = {
        CollectionId: COLLECTION_ID,
        FaceMatchThreshold: 0,
        Image: {
            Bytes: image
        },
        MaxFaces: 5
      };
      rekognition.searchFacesByImage(params, (error, data) => {
        if (error) {
          reject(error);
        } else {
          console.log(JSON.stringify(data));
          resolve(data);
        }
      });
    });
  }

  // end
  function onEnd(result) {
    console.log(JSON.stringify(result));
    callback(null, result);
  }

  // error
  function onError(error) {
    console.log(error, error.stack);
    callback(error, error.stack);
  }
};
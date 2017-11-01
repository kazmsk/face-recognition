'use strict';

//definition library
const aws = require('aws-sdk');
const rekognition = new aws.Rekognition();
const co = require('co');

//difinition variables
const COLLECTION_ID = 'COLLECTION_ID';

exports.handler = (event, context, callback) => {
  console.log('start function');

  // event params
  console.log(JSON.stringify(event));

  co(function* () {
    // image
    const base64Image = event.base64Image;
    const image = new Buffer(base64Image, 'base64');

    // check collections
    const collections = yield listCollections();

    // create collections
    if (collections.CollectionIds.indexOf(COLLECTION_ID) === -1) {
      yield createCollection();
    }

    // detects faces
    yield indexFaces(image);

    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      message: 'succeed'
    };
    return response;
  }).then(onEnd).catch(onError);

  // check collections
  function listCollections() {
    return new Promise((resolve, reject) => {
      const params = {};
      rekognition.listCollections(params, (error, data) => {
        if (error) {
          reject(error);
        } else {
          console.log(JSON.stringify(data));
          resolve(data);
        }
      });
    });
  }

  // create collections
  function createCollection() {
    return new Promise((resolve, reject) => {
      const params = {
        CollectionId: COLLECTION_ID
      };
      rekognition.createCollection(params, (error, data) => {
        if (error) {
          reject(error);
        } else {
          console.log(JSON.stringify(data));
          resolve(null);
        }
      });
    });
  }

  // detects faces
  function indexFaces(image) {
    return new Promise((resolve, reject) => {
      const params = {
        CollectionId: COLLECTION_ID,
        DetectionAttributes: [],
        Image: {
          Bytes: image
        }
      };
      rekognition.indexFaces(params, (error, data) => {
        if (error) {
          reject(error);
        } else {
          console.log(JSON.stringify(data));
          resolve(null);
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
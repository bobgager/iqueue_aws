/**
 * Created by bob on 7/7/17.
 */

var AWSS3 = {


    //******************************************************************************************************************
    s3UploadFile: function(bucket, fileName, file, callback){

        // Configure your region
        AWS.config.region = 'us-west-1';

        var bucket = new AWS.S3({params: {Bucket: bucket}});

        var params = {Key: fileName, ContentType: file.type, Body: file};

        bucket.upload(params, function (err, data) {
            var results = err ? 'ERROR!' : 'UPLOADED.';
            callback(results);
        });


    },

    //******************************************************************************************************************
    s3DeleteObject: function(bucket, key, callback){

        var s3 = new AWS.S3();

        var params = {
            Bucket: bucket,
            Key: key
        };
        s3.deleteObject(params, function(err, data) {
            if (err){
                //console.log(err, err.stack); // an error occurred
                callback();
            }
            else {
                //console.log(data);           // successful response
                callback();
            }
        });
    }

};

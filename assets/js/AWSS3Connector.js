/**
 * Created by bob on 7/7/17.
 */

var AWSS3 = {

    s3West: null,


    //******************************************************************************************************************
    s3UploadFile: function(bucket, fileName, file, callback){

        // Configure your region
        //AWS.config.region = 'us-west-1';

        //var bucket = new AWS.S3({params: {Bucket: bucket}});

        var params = {Bucket: bucket, Key: fileName, ContentType: file.type, Body: file};

        AWSS3.s3West.putObject(params, function (err, data) {
            var results = err ? 'ERROR!' : 'UPLOADED.';
            callback(results);
        });


    },

    //******************************************************************************************************************
    s3DeleteObject: function(bucket, key, callback){

        //var s3 = new AWS.S3();

        var params = {
            Bucket: bucket,
            Key: key
        };
        AWSS3.s3West.deleteObject(params, function(err, data) {
            if (err){
                //console.log(err, err.stack); // an error occurred
                callback();
            }
            else {
                //console.log(data);           // successful response
                callback();
            }
        });
    },

    //******************************************************************************************************************
    s3ReadBucketContents:function(bucket, callback){

        // Configure your region
        AWS.config.region = 'us-west-1';

        var bucket = new AWS.S3({params: {Bucket: bucket}});
        bucket.listObjects(function (err, data) {
            //console.log(err)
            if (err) {
                callback(null);
            }
            else {
                callback(data.Contents);
            }
        });


    }

};

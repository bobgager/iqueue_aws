/**
 * Created by bgager on 5/25/17.
 */

var awsDynamoDBConnector = {


    //******************************************************************************************************************
    deleteDisplaySlide: function(theSlide, callback){

        var params = {
            TableName : 'iqDisplayMessages',
            Key: {
                locationID: theSlide.locationID,
                messageID: theSlide.messageID
            }
        };

        awsCognitoConnector.dynamodbEast.delete(params, function(err, data) {
            //console.log('delete returned: '+  err);
            if (err){
                console.log('Error deleting slide from AWS: ' + err);
                callback();
            }
            else{
                callback();
            }
        });
    },

    //******************************************************************************************************************
    fetchCustomerConfig: function(customerID, callback){

        var params = {
            TableName: 'iqCustomerConfigs',
            KeyConditionExpression: 'customerID = :customerID ',
            ExpressionAttributeValues: {
                ':customerID': customerID
            }
        };

        awsCognitoConnector.dynamodbEast.query(params, function(err, data) {

            if (err){
               //error
                callback(false, err);
            }
            else {
                // successful response
                callback(true, data.Items[0]);
            }
        });

    },

    //******************************************************************************************************************
    fetchCustomerLocationsTable: function(customerID, callback){

        var params = {
            TableName: 'iqCustomerLocations',
            KeyConditionExpression: 'customerID = :customerID ',
            ExpressionAttributeValues: {
                ':customerID': customerID
            }
        };

        awsCognitoConnector.dynamodbEast.query(params, function(err, data) {

            if (err){
                callback(false, err)
            }
            else {
                // successful response

                //aws doesn't support empty strings, so need to do some replacement
                data.Items.forEach(function(location, index){
                    if(location.kioskMessageHeader === '~'){
                        location.kioskMessageHeader = '';
                    }
                    if(location.kioskMessageBody === '~'){
                        location.kioskMessageBody = '';
                    }
                });

                callback(true, data.Items);
            }
        });

    },

    //******************************************************************************************************************
    fetchCustomerUserTable: function(customerID, callback){

        var params = {
            TableName: 'iqUsers',
            KeyConditionExpression: 'customerID = :customerID',
            ExpressionAttributeValues: {
                ':customerID': customerID
            }
        };

        awsCognitoConnector.dynamodbEast.query(params, function(err, data) {

            if (err){
                //console.log(err); // an error occurred

                callback(false, err);

            }
            else {
                // successful response


                callback(true, data.Items);
            }
        });

    },

    //******************************************************************************************************************
    fetchDisplayMessages: function(locationID, callback){

        var params = {
            TableName: 'iqDisplayMessages',
            KeyConditionExpression: 'locationID = :locationID ',
            ExpressionAttributeValues: {
                ':locationID': locationID
            }
        };

        awsCognitoConnector.dynamodbEast.query(params, function(err, data) {
            //console.log('query returned: '+  err);
            if (err){
                callback(false, err);
            }
            else {
                //console.log(data);
                callback(true, data.Items);
            }
        });
    },

    //******************************************************************************************************************
    fetchSingleUser: function(customerID, userGUID, callback){

        // set an unauthenticated config object

        var creds = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:f769f5d7-6530-4e45-a689-27226bb6d05e'
        });
        AWS.config.credentials = creds;

        AWS.config.region = 'us-east-1';

        var dynamodbEast = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});


        var params = {
            Key: {
                "customerID": customerID ,
                "userGUID": userGUID
            },
            TableName: "iqUsers"
        };
        dynamodbEast.get(params, function(err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
                callback(false, err)
            }
            else {
                //console.log(data);           // successful response
                if (data.Item){
                    callback(true,data.Item.userDetails);
                }
                else {
                    callback(true,null)
                }

            }

        });
    },

    //******************************************************************************************************************
    saveDisplaySlide: function(theDisplaySlide, callback){

        var params = {
            TableName: 'iqDisplayMessages',
            Key: { locationID : theDisplaySlide.locationID, messageID : theDisplaySlide.messageID },

            UpdateExpression: "set message = :message, " +
            "backgroundImageURL=:backgroundImageURL," +
            "displayTime=:displayTime",
            ExpressionAttributeValues:{
                ":message":theDisplaySlide.message,
                ":backgroundImageURL":theDisplaySlide.backgroundImageURL,
                ":displayTime":theDisplaySlide.displayTime
            }
        };

        awsCognitoConnector.dynamodbEast.update(params, function(err, data) {

            //console.log('tried to update display slide and err= ' + err);

            if (err){
                //console.log(err);
                callback(false);
            }
            else {
                //console.log(data);
                callback(true);
            }
        });



    },

    //******************************************************************************************************************
    update_iqUsers: function (userDetails, callback) {
        var params = {
            TableName: 'iqUsers',
            Key: { customerID : userDetails.customerID, userGUID: userDetails.userGUID },
            UpdateExpression: "set userDetails=:userDetails",
            ExpressionAttributeValues:{
                ":userDetails": userDetails
            }
        };

        awsCognitoConnector.dynamodbEast.update(params, function(err, data) {
            //console.log('returned from update with err = ' + err);
            if (err){
                //console.log(err); // an error occurred
                callback(false, err);
            }
            else {
                //console.log(data);
                callback(true, data);
            }
        });

    }


    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************
};
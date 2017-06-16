/**
 * Created by bgager on 5/25/17.
 */

var awsDynamoDBConnector = {

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
    }

    //******************************************************************************************************************
    //******************************************************************************************************************
};
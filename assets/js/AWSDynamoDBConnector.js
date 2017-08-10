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
    fetchHelpedToday: function(locationID, callback){

        var thisMorning = new Date();
        thisMorning.setHours(0);
        thisMorning.setMinutes(1);

        thisMorning = thisMorning.getTime();

        var params = {
            TableName: 'iqClosedQueue',
            KeyConditionExpression: 'locationID = :locationID and createTime > :thisMorning ',
            ExpressionAttributeValues: {
                ':locationID': locationID,
                ':thisMorning': thisMorning
            }
        };

        awsCognitoConnector.dynamodbEast.query(params, function(err, data) {


            if (err){

                callback(false, err);
            }
            else {
                // successful response

                //sort ascending by the create time
                data.Items.sort(function(a, b){
                    var createTimeA=a.createTime, createTimeB=b.createTime
                    if (createTimeA < createTimeB) //sort  ascending
                        return -1
                    if (createTimeA > createTimeB)
                        return 1
                    return 0 //default return value (no sorting)
                });

                var filteredResults = data.Items.filter(function(item){
                    return item.issueStatus === 'Closed';
                });


                callback(true, filteredResults);
            }
        });
    },

    //******************************************************************************************************************
    fetchSingleUser: function(customerID, userGUID, callback){

        var params = {
            Key: {
                "customerID": customerID ,
                "userGUID": userGUID
            },
            TableName: "iqUsers"
        };
        awsCognitoConnector.dynamodbEast.get(params, function(err, data) {
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
    fetchWaitTime: function(locationID, callback){

        var params = {
            TableName: 'iqOpenQueue',
            IndexName: 'locationID-issueStatus-index',
            KeyConditionExpression: 'locationID = :locationID and issueStatus = :issueStatus ',
            ExpressionAttributeValues: {
                ':locationID': locationID,
                ':issueStatus': 'Open'
            }
        };

        awsCognitoConnector.dynamodbEast.query(params, function(err, data) {

            //console.log('returned from fetchWaitTime with err= ' + err);

            if (err){
                //console.log(err); // an error occurred
                callback(false, err);


            }
            else {
                // successful response

                for (var i=0;i<data.Items.length;i++)
                {
                    data.Items[i].guid = data.Items[i].personID;

                    data.Items[i].createDateTime = new Date(data.Items[i].createTime);
                    //var temp = utils.calibratedDateTime()
                    data.Items[i].waitTime = utils.calibratedDateTime() - data.Items[i].createDateTime;
                }

                //sort ascending by the create time
                data.Items.sort(function(a, b){
                    var createTimeA=a.createTime, createTimeB=b.createTime
                    if (createTimeA < createTimeB) //sort  ascending
                        return -1
                    if (createTimeA > createTimeB)
                        return 1
                    return 0 //default return value (no sorting)
                });


                callback(true, data.Items);
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
            "displayTime=:displayTime," +
            "slidePosition=:slidePosition",
            ExpressionAttributeValues:{
                ":message":theDisplaySlide.message,
                ":backgroundImageURL":theDisplaySlide.backgroundImageURL,
                ":displayTime":theDisplaySlide.displayTime,
                ":slidePosition":theDisplaySlide.slidePosition
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
    updateCustomerLocationsTable: function (theLocation, callback) {


        var params = {
            TableName: 'iqCustomerLocations',
            Key: { locationID : theLocation.locationID, customerID : theLocation.customerID },

            UpdateExpression: "set displayAnnounceMessage = :dam ",
            ExpressionAttributeValues:{
                ":dam": theLocation.displayAnnounceMessage
            }
        };

        awsCognitoConnector.dynamodbEast.update(params, function(err, data) {
            if (err){
                callback(false,err)
            }
            else {
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

    },

    //******************************************************************************************************************
    updateNameCoach: function (customerID, configCode, useNameCoach, nameCoachAuthToken, nameCoachAccessCode, callback) {

        var params = {
            TableName: 'iqCustomerConfigs',
            Key: { customerID : customerID, configCode : configCode },
            UpdateExpression: "set useNameCoach=:useNameCoach, nameCoachAuthToken=:nameCoachAuthToken, nameCoachAccessCode=:nameCoachAccessCode",
            ExpressionAttributeValues:{
                ":useNameCoach": useNameCoach,
                ":nameCoachAuthToken": nameCoachAuthToken,
                ":nameCoachAccessCode": nameCoachAccessCode
            }
        };

        awsCognitoConnector.dynamodbEast.update(params, function(err, data) {
            //console.log('returned from update with err = ' + err);
            if (err){
                //console.log(err); // an error occurred
                callback(false,err);
            }
            else {
                //console.log(data);
                callback(true);
            }
        });


    },


    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************
};
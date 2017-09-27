/**
 * Created by bgager on 5/25/17.
 */

var awsDynamoDBConnector = {



    //******************************************************************************************************************
    addTouchpointListItem: function (newTouchpointListItem, callback) {

        //don't allow double or single quotes
        newTouchpointListItem.department = newTouchpointListItem.department.replace(/'/g, "");
        newTouchpointListItem.department = newTouchpointListItem.department.replace(/"/g, "");

        //don't allow double or single quotes
        newTouchpointListItem.category = newTouchpointListItem.category.replace(/'/g, "");
        newTouchpointListItem.category = newTouchpointListItem.category.replace(/"/g, "");

        //don't allow double or single quotes
        newTouchpointListItem.subcategory = newTouchpointListItem.subcategory.replace(/'/g, "");
        newTouchpointListItem.subcategory = newTouchpointListItem.subcategory.replace(/"/g, "");

        var params = {
            TableName : 'iqTouchPointList',
            Item: {
                locationID: newTouchpointListItem.locationID,
                touchPointID: utils.guid(),
                department: newTouchpointListItem.department,
                category: newTouchpointListItem.category,
                subcategory: newTouchpointListItem.subcategory
            }
        };

        awsCognitoConnector.dynamodbEast.put(params, function(err, data) {
            if (err){
                //console.log(err);
                callback(false, err);
            }
            else{
                callback(true);
            }

        });
    },

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
    deleteMethodOfService: function(theLocation, methodOfServiceID, callback){

        var params = {
            TableName : 'iqMethodsOfService',
            Key: {
                theLocation: theLocation,
                methodOfServiceID: methodOfServiceID
            }
        };

        awsCognitoConnector.dynamodbEast.delete(params, function(err, data) {
            if (err){
                //console.log(err);
                callback(false,err);
            }
            else{
                //console.log(data);
                callback(true);
            }

        });

    },

    //******************************************************************************************************************
    deleteTouchpointListItem: function(locationID, touchPointID, callback){

        var params = {
            TableName : 'iqTouchPointList',
            Key: {
                locationID: locationID,
                touchPointID: touchPointID
            }
        };

        awsCognitoConnector.dynamodbEast.delete(params, function(err, data) {
            if (err){
                callback(false,err);
            }
            else{
                callback(true);
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
    fetchMethodsOfService: function(locationID, callback){

        var params = {
            TableName: 'iqMethodsOfService',
            KeyConditionExpression: 'theLocation = :lkey',
            ExpressionAttributeValues: {
                ':lkey': locationID
            }
        };

        awsCognitoConnector.dynamodbEast.query(params, function(err, data) {
            //console.log('err= ' + err);
            if (err){

                callback (false, err);

            }
            else{
                //console.log(data);
                callback(true, data.Items);
            }
        });
    },

    //******************************************************************************************************************
    fetchQueue: function(status, locationID, callback){

        var params = {
            TableName: 'iqOpenQueue',
            IndexName: 'locationID-issueStatus-index',
            KeyConditionExpression: 'locationID = :locationID and issueStatus = :issueStatus ',
            ExpressionAttributeValues: {
                ':locationID': locationID,
                ':issueStatus': status
            }
        };

        awsCognitoConnector.dynamodbEast.query(params, function(err, data) {

            if (err){
                return (false, err);

            }
            else {
                // successful response

                for (var i=0;i<data.Items.length;i++)
                {
                    data.Items[i].guid = data.Items[i].personID;

                    data.Items[i].createDateTime = new Date(data.Items[i].createTime);

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
    fetchTouchpointList: function(locationID, callback){

        var params = {
            TableName: 'iqTouchPointList',
            KeyConditionExpression: 'locationID = :lkey',
            ExpressionAttributeValues: {
                ':lkey': locationID
            }
        };

        awsCognitoConnector.dynamodbEast.query(params, function(err, data) {
            //console.log('err= ' + err);
            if (err){
                //console.log(err);
                callback(false, err);

            }
            else{
                //console.log(data);

                //remove all the spaces in the subcategory field

                data.Items.forEach(function(touchPoint) {

                    if(touchPoint.subcategory === ' '){
                        touchPoint.subcategory = null;
                    }

                });

                callback(true, data.Items);
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
    saveMethodOfService: function(locationID, methodOfServiceID, newMOS, callback){

        var params = {
            TableName : 'iqMethodsOfService',
            Item: {
                theLocation: locationID,
                methodOfServiceID: methodOfServiceID,
                methodOfServiceName: newMOS
            }
        };

        awsCognitoConnector.dynamodbEast.put(params, function(err, data) {
            if (err){
                //console.log(err);
                callback(false, err);
            }
            else{
                //console.log(data);
                callback(true);
            }


        });


    },

    //******************************************************************************************************************
    updateAllowedDomains: function(theCustomer, allowedDomains, callback){

        var params = {
            TableName: 'iqCustomerConfigs',
            Key: { customerID : theCustomer.customerID, configCode : theCustomer.configCode },

            UpdateExpression: "set allowedDomains = :ad",
            ExpressionAttributeValues:{
                ":ad":allowedDomains
            }
        };

        awsCognitoConnector.dynamodbEast.update(params, function(err, data) {

            //console.log('tried to update allowed domains and err= ' + err);

            if (err){
                //console.log(err);

                callback(false,err);
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
    updateTouchpointListItem: function (locationID, updatedTouchpointListItem, callback) {

        var params = {
            TableName: 'iqTouchPointList',
            Key: { locationID : locationID, touchPointID : updatedTouchpointListItem.touchPointID },

            UpdateExpression: "set department = :dpt, category=:ctg, subcategory=:sctg ",
            ExpressionAttributeValues:{
                ":dpt":updatedTouchpointListItem.department,
                ":ctg":updatedTouchpointListItem.category,
                ":sctg":updatedTouchpointListItem.subcategory
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
    //******************************************************************************************************************
    //******************************************************************************************************************
};
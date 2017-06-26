/**
 * Created by bgager on 2/4/16.
 */

var awsConnector = {

    dynamodbEast: null,
    lastHeartbeat: new Date(),

    //******************************************************************************************************************
    initializeAWS: function(callback){

        // set the default config object
        var creds = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:f769f5d7-6530-4e45-a689-27226bb6d05e'
        });
        AWS.config.credentials = creds;

        AWS.config.region = 'us-east-1';

        //console.log('creating dynamodbEast');
        this.dynamodbEast = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
        //console.log('dynamodbEast creation complete');

        callback();

    },

    //******************************************************************************************************************
    fetchAppConfig: function(callback){

        var params = {
            TableName: 'Configurations',
            KeyConditionExpression: 'application = :appkey ',
            ExpressionAttributeValues: {
                ':appkey': 'iQueue'
            }
        };

        this.dynamodbEast.query(params, function(err, data) {

            if (err){
                //console.log(err); // an error occurred
                bootbox.dialog({
                    message: 'Please double check that you are connected to the internet.<br><br>Error Code: aws-fac-001.<br><br>Error= ' + err,
                    title: "There was an error communicating with our server.",
                    closeButton: false,
                    buttons: {
                        main: {
                            label: "Bummer",
                            className: "btn-primary",
                            callback: function() {
                                window.location = 'http://www.iq.cobaltfire.com';
                            }
                        }
                    }
                });

            }
            else {
                // successful response
                globals.AppConfiguration = data.Items[0];
                callback();
            }
        });

    },

    //******************************************************************************************************************
    fetchCustomerConfig: function(callback){

        var params = {
            TableName: 'iqCustomerConfigs',
            KeyConditionExpression: 'customerID = :ppkey ',
            ExpressionAttributeValues: {
                ':ppkey': susi.theUser.customerID
            }
        };

        this.dynamodbEast.query(params, function(err, data) {

            if (err){
                //console.log(err); // an error occurred
                bootbox.dialog({
                    message: 'Please double check that you are connected to the internet.<br><br>Error Code: aws-fcc-001.<br><br>Error= ' + err,
                    title: "There was an error communicating with our server.",
                    closeButton: false,
                    buttons: {
                        main: {
                            label: "Bummer",
                            className: "btn-primary",
                            callback: function() {
                                window.location = 'http://www.iq.cobaltfire.com';
                            }
                        }
                    }
                });

            }
            else {
                // successful response
                globals.customer = data.Items[0];
                callback();
            }
        });

    },

    //******************************************************************************************************************
    fetchCustomerConfigByConfigCode: function(configCode, callback){

        var params = {
            TableName: 'iqCustomerConfigs',
            IndexName: 'configCode-index',
            KeyConditionExpression: 'configCode = :cckey ',
            ExpressionAttributeValues: {
                ':cckey': configCode
            }
        };

        this.dynamodbEast.query(params, function(err, data) {

            //console.log('returned from fetchCustomerConfigByConfigCode with err= ' + err);

            if (err){
                //console.log(err); // an error occurred
                bootbox.dialog({
                    message: 'Please double check that you are connected to the internet.<br><br>Error Code: aws-fcc-001.<br><br>Error= ' + err,
                    title: "There was an error communicating with our server.",
                    closeButton: false,
                    buttons: {
                        main: {
                            label: "Bummer",
                            className: "btn-primary",
                            callback: function() {
                                window.location = 'http://www.iq.cobaltfire.com';
                            }
                        }
                    }
                });

            }
            else {
                // successful response
                globals.customer = data.Items[0];
                callback();
            }
        });

    },

    //******************************************************************************************************************
    updateNameCoach: function (useNameCoach, nameCoachAuthToken, nameCoachAccessCode, callback) {

        var params = {
            TableName: 'iqCustomerConfigs',
            Key: { customerID : globals.customer.customerID, configCode : globals.customer.configCode },
            UpdateExpression: "set useNameCoach=:useNameCoach, nameCoachAuthToken=:nameCoachAuthToken, nameCoachAccessCode=:nameCoachAccessCode",
            ExpressionAttributeValues:{
                ":useNameCoach": useNameCoach,
                ":nameCoachAuthToken": nameCoachAuthToken,
                ":nameCoachAccessCode": nameCoachAccessCode
            }
        };

        this.dynamodbEast.update(params, function(err, data) {
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
    updateScannerChoice: function (useScanner, callback) {

        var params = {
            TableName: 'iqCustomerLocations',
            Key: { customerID : globals.customer.customerID, locationID : globals.theLocationID },
            UpdateExpression: "set useScanner=:useScanner",
            ExpressionAttributeValues:{
                ":useScanner": useScanner
            }
        };

        this.dynamodbEast.update(params, function(err, data) {
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
    fetchCustomerLocationsTable: function(callback){

        var params = {
            TableName: 'iqCustomerLocations',
            KeyConditionExpression: 'customerID = :customerID ',
            ExpressionAttributeValues: {
                ':customerID': globals.customer.customerID
            }
        };

        this.dynamodbEast.query(params, function(err, data) {

            if (err){
                //console.log(err); // an error occurred
                bootbox.dialog({
                    message: 'Please double check that you are connected to the internet.<br><br>Error Code: aws-fcc-001.<br><br>Error= ' + err,
                    title: "There was an error communicating with our server.",
                    closeButton: false,
                    buttons: {
                        main: {
                            label: "Bummer",
                            className: "btn-primary",
                            callback: function() {
                                window.location = 'http://www.iq.cobaltfire.com';
                            }
                        }
                    }
                });

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
                })



                globals.theLocationsArray = data.Items;
                callback();
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
                ":dam":theLocation.displayAnnounceMessage
            }
        };

        this.dynamodbEast.update(params, function(err, data) {
            if (err){
                callback(false,err)
            }
            else {
                callback(true);
            }
        });


    },

    //******************************************************************************************************************
    fetchWaitTime: function(callback){

        var params = {
            TableName: 'iqOpenQueue',
            IndexName: 'locationID-issueStatus-index',
            KeyConditionExpression: 'locationID = :locationID and issueStatus = :issueStatus ',
            ExpressionAttributeValues: {
                ':locationID': globals.theLocationID,
                ':issueStatus': 'Open'
            }
        };

        this.dynamodbEast.query(params, function(err, data) {

            //console.log('returned from fetchWaitTime with err= ' + err);

            if (err){
                //console.log(err); // an error occurred
                $('#statusLabel').html('<i class="fa fa-exclamation-circle"></i> Error: fwt001');
                awsConnector.fetchWaitTime(callback);


            }
            else {
                // successful response

                for (var i=0;i<data.Items.length;i++)
                {
                    data.Items[i].guid = data.Items[i].personID;

                    data.Items[i].createDateTime = new Date(data.Items[i].createTime);
                    var temp = cobaltfireUtils.calibratedDateTime()
                    data.Items[i].waitTime = cobaltfireUtils.calibratedDateTime() - data.Items[i].createDateTime;
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


                callback(data.Items);
            }
        });

    },

    //******************************************************************************************************************
    fetchActiveQueue: function(callback){

        var params = {
            TableName: 'iqOpenQueue',
            IndexName: 'locationID-issueStatus-index',
            KeyConditionExpression: 'locationID = :locationID and issueStatus = :issueStatus ',
            ExpressionAttributeValues: {
                ':locationID': globals.theLocationID,
                ':issueStatus': 'Active'
            }
        };

        this.dynamodbEast.query(params, function(err, data) {

            //console.log('returned from fetchWaitTime with err= ' + err);

            if (err){
                //console.log(err); // an error occurred
                //$('#statusLabel').html('<i class="fa fa-exclamation-circle"></i> Error: fwt001');
                //awsConnector.fetchActiveQueue(callback);
                /*                myApp.modal({
                 title:  'DOH!',
                 text: 'There was an error communicating with our server.<br><br>Please check that you are connected to the internet and launch iQueue Mobile again.<br><br>(Error Code: fwt001)',
                 buttons: [
                 {
                 text: 'Try Again',
                 bold: true,
                 onClick: function() {
                 awsConnector.fetchWaitTime(callback);
                 }
                 }
                 ]
                 });*/

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


                callback(data.Items);
            }
        });

    },

    //******************************************************************************************************************
    fetchFAQs: function(callback){

       var params = {
            TableName: 'iqFAQs',
            KeyConditionExpression: 'locationID = :locationID',
            ExpressionAttributeValues: {
                ':locationID': globals.theLocationID
            }
        };

        this.dynamodbEast.query(params, function(err, data) {

            //console.log('returned from fetchWaitTime with err= ' + err);

            if (err){
                //console.log(err); // an error occurred

                callback(null);

            }
            else {
                // successful response


                callback(data.Items);
            }
        });

    },

    //******************************************************************************************************************
    saveFAQ: function(theFAQ, callback){

        //don't allow double or single quotes
        theFAQ.question = theFAQ.question.replace(/'/g, "");
        theFAQ.question = theFAQ.question.replace(/"/g, "");

        var params = {
            TableName : 'iqFAQs',
            Item: {
                locationID: theFAQ.locationID,
                faqID: theFAQ.faqID,
                category: theFAQ.category,
                question: theFAQ.question
            }
        };


        this.dynamodbEast.put(params, function(err, data) {
            if (err){
                //console.log(err);
            }
            else{
                //console.log(data);
            }

            callback(data);
        });


    },

    //******************************************************************************************************************
    deleteFAQ: function(theFAQ, callback){

       var params = {
            TableName : 'iqFAQs',
            Key: {
                locationID: theFAQ.locationID,
                faqID: theFAQ.faqID
            }
        };

        this.dynamodbEast.delete(params, function(err, data) {
            if (err){
                //console.log(err);
            }
            else{
                //console.log(data);
            }
            callback(data);
        });

    },

    //******************************************************************************************************************
    fetchHelpedToday: function(callback){


        var thisMorning = new Date();
        thisMorning.setHours(0);
        thisMorning.setMinutes(1);

        thisMorning = thisMorning.getTime();

        var params = {
            TableName: 'iqClosedQueue',
            KeyConditionExpression: 'locationID = :locationID and createTime > :thisMorning ',
            ExpressionAttributeValues: {
                ':locationID': globals.theLocationID,
                ':thisMorning': thisMorning
            }
        };

        this.dynamodbEast.query(params, function(err, data) {

            //console.log('returned from fetchWaitTime with err= ' + err);

            if (err){
                //console.log(err); // an error occurred

                /*                myApp.modal({
                 title:  'DOH!',
                 text: 'There was an error communicating with our server.<br><br>Please check that you are connected to the internet and launch iQueue Mobile again.<br><br>(Error Code: fwt001)',
                 buttons: [
                 {
                 text: 'Try Again',
                 bold: true,
                 onClick: function() {
                 awsConnector.fetchWaitTime(callback);
                 }
                 }
                 ]
                 });*/

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


                callback(filteredResults);
            }
        });
    },

    //******************************************************************************************************************
    fetchAQuestion: function(personID, callback){



        var params = {
            TableName: 'iqOpenQueue',
            KeyConditionExpression: 'locationID = :locationID and personID = :personID ',
            ExpressionAttributeValues: {
                ':locationID': globals.theLocationID,
                ':personID': personID
            }
        };

        this.dynamodbEast.query(params, function(err, data) {
            //console.log('returned from fetchMyQuestion with err= ' + err);
            if (err){
                //console.log(err); // an error occurred
                //TODO move this user messaging out or the awsconnector file
                myApp.modal({
                    title:  'DOH!',
                    text: 'There was an error communicating with our server.<br><br>Please check that you are connected to the internet and launch iQueue Mobile again.<br><br>(Error Code: fmq001)',
                    buttons: [
                        {
                            text: 'Try Again',
                            bold: true,
                            onClick: function() {
                                awsConnector.fetchAQuestion(personID, callback);
                            }
                        }
                    ]
                });

            }
            else {
                // successful response
                if(data.Count === 0){
                    //no records match
                    callback(null);
                    return;
                }
                callback(data.Items[0]);
            }
        });


    },

    //******************************************************************************************************************
    setQuestionActive: function(personID,callback){


        //figure out the current date and time
        var now = cobaltfireUtils.calibratedDateTime();

        var params = {
            TableName: 'iqOpenQueue',
            Key: { locationID : globals.theLocationID, personID: personID },
            UpdateExpression: "set issueStatus=:status, activeTime=:activeTime, closedBy=:closedBy",
            ExpressionAttributeValues:{
                ":status": 'Active',
                ":activeTime": now.getTime(),
                ":closedBy": susi.theUser.first +' '+ susi.theUser.last
            },
            ReturnValues: "ALL_NEW"
        };

        this.dynamodbEast.update(params, function(err, data) {

            if (err){
                //console.log(err); // an error occurred
                //TODO move this user messaging out or the awsconnector file
                myApp.modal({
                    title:  'DOH!',
                    text: 'There was an error communicating with our server.<br><br>Please check that you are connected to the internet and try again.<br><br>(Error Code: sqa001)',
                    buttons: [
                        {
                            text: 'Start Over',
                            bold: true,
                            onClick: function() {

                                window.location = 'http://iq.cobaltfire.com';
                            }
                        },
                        {
                            text: 'Try Again',
                            bold: true,
                            onClick: function() {
                                awsConnector.setQuestionActive(personID,callback);
                            }
                        }
                    ]
                });
            }
            else {
                //console.log(data);
                callback(data.Attributes);
            }
        });

    },

    //******************************************************************************************************************
    setQuestionOpen: function(theQuestion,callback){


        if(!theQuestion.comments){
            theQuestion.comments = " ";
        }

        var params = {
            TableName: 'iqOpenQueue',
            Key: { locationID : globals.theLocationID, personID: theQuestion.personID },
            UpdateExpression: "set issueStatus=:status, category=:category, comments=:comments, email=:email, cellphone=:cellphone",
            ExpressionAttributeValues:{
                ":status": 'Open',
                ":category": theQuestion.category,
                ":comments": theQuestion.comments,
                ":email": theQuestion.email,
                ":cellphone": theQuestion.cellphone
            }
        };

        this.dynamodbEast.update(params, function(err, data) {
            //console.log('returned from update with err = ' + err);
            if (err){
                //console.log(err); // an error occurred
                //TODO move this user messaging out or the awsconnector file
                myApp.modal({
                    title:  'DOH!',
                    text: 'There was an error communicating with our server.<br><br>Please check that you are connected to the internet and try again.<br><br>(Error Code: sqo001)',
                    buttons: [
                        {
                            text: 'Cancel',
                            bold: true,
                            onClick: function() {

                            }
                        },
                        {
                            text: 'Try Again',
                            bold: true,
                            onClick: function() {
                                awsConnector.setQuestionOpen(theQuestion,callback);
                            }
                        }
                    ]
                });
            }
            else {
                //console.log(data);
                callback();
            }
        });

    },

    //******************************************************************************************************************
    setQuestionNoShow: function(theQuestion,callback){

        var params = {
            TableName: 'iqOpenQueue',
            Key: { locationID : globals.theLocationID, personID: theQuestion.personID },
            UpdateExpression: "set issueStatus=:status, category=:category, comments=:comments, email=:email, closeTime=:closeTime, cellphone=:cellphone",
            ExpressionAttributeValues:{
                ":status": 'NoShow',
                ":category": theQuestion.category,
                ":comments": theQuestion.comments,
                ":email": theQuestion.email,
                ":closeTime": cobaltfireUtils.calibratedDateTime().getTime(),
                ":cellphone": theQuestion.cellphone
            }
        };

        this.dynamodbEast.update(params, function(err, data) {
            //console.log('returned from update with err = ' + err);
            if (err){
                //console.log(err); // an error occurred
                //TODO move this user messaging out or the awsconnector file
                myApp.modal({
                    title:  'DOH!',
                    text: 'There was an error communicating with our server.<br><br>Please check that you are connected to the internet and try again.<br><br>(Error Code: sqns001)',
                    buttons: [
                        {
                            text: 'Cancel',
                            bold: true,
                            onClick: function() {

                            }
                        },
                        {
                            text: 'Try Again',
                            bold: true,
                            onClick: function() {
                                awsConnector.setQuestionNoShow(theQuestion,callback);
                            }
                        }
                    ]
                });
            }
            else {
                //console.log(data);
                callback();
            }
        });

    },

    //******************************************************************************************************************
    setQuestionClosed: function(theQuestion,callback){

       var params = {
            TableName: 'iqOpenQueue',
            Key: { locationID : globals.theLocationID, personID: theQuestion.personID },
            UpdateExpression: "set issueStatus=:status, category=:category, comments=:comments, email=:email, closeTime=:closeTime, cellphone=:cellphone",
            ExpressionAttributeValues:{
                ":status": 'Closed',
                ":category": theQuestion.category,
                ":comments": theQuestion.comments,
                ":email": theQuestion.email,
                ":closeTime": cobaltfireUtils.calibratedDateTime().getTime(),
                ":cellphone": theQuestion.cellphone
            }
        };

        this.dynamodbEast.update(params, function(err, data) {
            //console.log('returned from update with err = ' + err);
            if (err){
                //console.log(err); // an error occurred
                //TODO move this user messaging out or the awsconnector file
                myApp.modal({
                    title:  'DOH!',
                    text: 'There was an error communicating with our server.<br><br>Please check that you are connected to the internet and try again.<br><br>(Error Code: sqc001)',
                    buttons: [
                        {
                            text: 'Cancel',
                            bold: true,
                            onClick: function() {

                            }
                        },
                        {
                            text: 'Try Again',
                            bold: true,
                            onClick: function() {
                                awsConnector.setQuestionClosed(theQuestion,callback);
                            }
                        }
                    ]
                });
            }
            else {
                //console.log(data);
                callback();
            }
        });

    },

    //******************************************************************************************************************
    saveClosedQuestion: function(theQuestion, callback){

        var params = {
            TableName : 'iqClosedQueue',
            Item: {
                locationID: theQuestion.locationID,
                createTime: theQuestion.createTime,

                customerID: globals.customer.customerID,
                issueStatus: theQuestion.issueStatus,
                activeTime: theQuestion.activeTime,
                closeTime: cobaltfireUtils.calibratedDateTime().getTime(),
                closedBy: theQuestion.closedBy,
                category: theQuestion.category,
                firstName: theQuestion.firstName,
                firstNameLC: theQuestion.firstName.toLowerCase(),
                lastName: theQuestion.lastName,
                lastNameLC: theQuestion.lastName.toLowerCase(),
                question: theQuestion.question,
                questionID: theQuestion.questionID,
                comments: theQuestion.comments,
                cellphone: theQuestion.cellphone,
                signonsource: theQuestion.signonsource,
                email: theQuestion.email,
                nameCoachMetric: theQuestion.nameCoachMetric


            }
        };


        this.dynamodbEast.put(params, function(err, data) {
            if (err){
                //console.log(err);

            }
            else{
                //console.log(data);
            }

            callback();
        });


    },

    //******************************************************************************************************************
    saveQuestion: function(status,callback){

        //figure out the current date and time
        var now = cobaltfireUtils.calibratedDateTime();

        if(status === 'Open'){
            //create a new guid if this is a new question
            globals.setPersistentGlobal('myguid', cobaltfireUtils.guid());

            //make sure none of the optional parameters are empty
            if(globals.userEmail === ''){globals.userEmail = '?'}
            if(globals.userCellPhoneNumber === ''){globals.userCellPhoneNumber = '?'}
            if(globals.theSubCategoryID === ''){globals.theSubCategoryID = 'n/a'}

            var params = {
                TableName: 'iqOpenQueue',
                Key: { locationID : globals.theLocationID, personID: globals.myguid },
                UpdateExpression: "set createTime = :ct, issueStatus=:status, firstName=:firstName, lastName=:lastName, email=:email, category=:category, question=:question, questionID=:questionID, cellphone=:cellphone, signonsource=:signonsource, nameCoachMetric=:nameCoachMetric ",
                ExpressionAttributeValues:{
                    ":ct": now.getTime(),
                    ":status": status,
                    ":firstName": globals.userFirstName,
                    ":lastName": globals.userLastName,
                    ":email": globals.userEmail,
                    ":category": globals.theCategoryName,
                    ":question": globals.theSubCategoryQuestion,
                    ":questionID": globals.theSubCategoryID.toString(),
                    ":cellphone": globals.userCellPhoneNumber,
                    ":signonsource": 'kiosk',
                    ":nameCoachMetric": summaryPage.nameCoachMetric
                }
            };
        }
        else{
            var params = {
                TableName: 'iqOpenQueue',
                Key: { locationID : globals.theLocationID, personID: globals.myguid },
                UpdateExpression: "set issueStatus=:status",
                ExpressionAttributeValues:{
                    ":status": status
                }
            };
        }




        this.dynamodbEast.update(params, function(err, data) {
            //myApp.alert('Tried to update iqOpenQueue and err= ' + err);

            //hide the preloader
            myApp.hidePreloader();

            if (err){
                console.log(err); // an error occurred
                //TODO move this user messaging out or the awsconnector file
                myApp.modal({
                    title:  'DOH!',
                    text: 'There was an error communicating with our server.<br><br>Please check that you are connected to the internet and try again.<br><br>(Error Code: sq001)',
                    buttons: [
                        {
                            text: 'Start Over',
                            bold: true,
                            onClick: function() {

                                //clear the guid
                                globals.setPersistentGlobal('myguid','');
                                //go home
                                app.reloadKiosk();
                            }
                        },
                        {
                            text: 'Try Again',
                            bold: true,
                            onClick: function() {
                                awsConnector.saveQuestion(status, callback);
                            }
                        }
                    ]
                });
            }
            else {
                //console.log(data);
                var results = {success: true};
                callback(results);
            }
        });

    },

    //******************************************************************************************************************
    fetchMethodsOfService: function(callback){

        var params = {
            TableName: 'iqMethodsOfService',
            KeyConditionExpression: 'theLocation = :lkey',
            ExpressionAttributeValues: {
                ':lkey': globals.theLocationID
            }
        };

        this.dynamodbEast.query(params, function(err, data) {
            //console.log('err= ' + err);
            if (err){
                //console.log(err);
                //TODO move this user messaging out of the awsconnector file
                bootbox.dialog({
                    message: 'Please double check that you are connected to the internet.<br><br>Error Code: aws-fmos-001.<br><br>Error= ' + err,
                    title: "There was an error communicating with our server.",
                    closeButton: false,
                    buttons: {
                        main: {
                            label: "Bummer",
                            className: "btn-primary",
                            callback: function() {
                                window.location = 'http://www.iq.cobaltfire.com';
                            }
                        }
                    }
                });

            }
            else{
                //console.log(data);
                callback(data.Items);
            }
        });
    },

    //******************************************************************************************************************
    saveMethodOfService: function(newMOS, callback){

        var params = {
            TableName : 'iqMethodsOfService',
            Item: {
                theLocation: globals.theLocationID,
                methodOfServiceID: cobaltfireUtils.guid(),
                methodOfServiceName: newMOS
            }
        };

        this.dynamodbEast.put(params, function(err, data) {
            if (err){
                //console.log(err);
                //TODO move this user messaging out of the awsconnector file
                bootbox.dialog({
                    message: 'Please double check that you are connected to the internet and try again.<br><br>Error Code: aws-smos-001.<br><br>Error= ' + err,
                    title: "There was an error saving your Method Of Service.",
                    closeButton: false,
                    buttons: {
                        main: {
                            label: "Bummer",
                            className: "btn-primary",
                            callback: function() {

                            }
                        }
                    }
                });
            }
            else{
                //console.log(data);
            }

            callback();
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

        this.dynamodbEast.delete(params, function(err, data) {
            if (err){
                //console.log(err);
                //TODO move this user messaging out or the awsconnector file
                bootbox.dialog({
                    message: 'Please double check that you are connected to the internet and try again.<br><br>Error Code: aws-dmos-001.<br><br>Error= ' + err,
                    title: "There was an error deleting your Method Of Service.",
                    closeButton: false,
                    buttons: {
                        main: {
                            label: "Bummer",
                            className: "btn-primary",
                            callback: function() {

                            }
                        }
                    }
                });
            }
            else{
                //console.log(data);
            }
            callback();
        });

    },

    //******************************************************************************************************************
    fetchTouchpointList: function(callback){

        var params = {
            TableName: 'iqTouchPointList',
            KeyConditionExpression: 'locationID = :lkey',
            ExpressionAttributeValues: {
                ':lkey': globals.theLocationID
            }
        };

        this.dynamodbEast.query(params, function(err, data) {
            //console.log('err= ' + err);
            if (err){
                //console.log(err);
                callback(null);

            }
            else{
                //console.log(data);

                //remove all the spaces in the subcategory field

                data.Items.forEach(function(touchPoint) {

                    if(touchPoint.subcategory === ' '){
                        touchPoint.subcategory = null;
                    }

                });

                callback(data.Items);
            }
        });
    },

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
                locationID: globals.theLocationID,
                touchPointID: cobaltfireUtils.guid(),
                department: newTouchpointListItem.department,
                category: newTouchpointListItem.category,
                subcategory: newTouchpointListItem.subcategory
            }
        };

        this.dynamodbEast.put(params, function(err, data) {
            if (err){
                //console.log(err);
                callback(false);
            }
            else{
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

        this.dynamodbEast.delete(params, function(err, data) {
            if (err){
                callback(false,err);
            }
            else{
                callback(true);
            }

        });

    },

    //******************************************************************************************************************
    updateTouchpointListItem: function (updatedTouchpointListItem, callback) {

        var params = {
            TableName: 'iqTouchPointList',
            Key: { locationID : globals.theLocationID, touchPointID : updatedTouchpointListItem.touchPointID },

            UpdateExpression: "set department = :dpt, category=:ctg, subcategory=:sctg ",
            ExpressionAttributeValues:{
                ":dpt":updatedTouchpointListItem.department,
                ":ctg":updatedTouchpointListItem.category,
                ":sctg":updatedTouchpointListItem.subcategory
            }
        };

        this.dynamodbEast.update(params, function(err, data) {
            if (err){
                callback(false,err)
            }
            else {
                callback(true);
            }
        });

    },

    //******************************************************************************************************************
    updateAllowedDomains: function(allowedDomains, callback){

        loading("show",'check',"Saving",1000,false);

        var params = {
            TableName: 'iqCustomerConfigs',
            Key: { customerID : globals.customer.customerID, configCode : globals.customer.configCode },

            UpdateExpression: "set allowedDomains = :ad",
            ExpressionAttributeValues:{
                ":ad":allowedDomains
            }
        };

        this.dynamodbEast.update(params, function(err, data) {

            //console.log('tried to update allowed domains and err= ' + err);

            if (err){
                //console.log(err);
                //TODO move this user messaging out or the awsconnector file
                bootbox.dialog({
                    message: 'Please double check that you are connected to the internet and try again.<br><br>Error Code: aws-uad-001.<br><br>Error= ' + err,
                    title: "There was an error updating the Allowed Domains.",
                    closeButton: false,
                    buttons: {
                        main: {
                            label: "Bummer",
                            className: "btn-primary",
                            callback: function() {

                            }
                        }
                    }
                });
            }
            else {
                //console.log(data);
                callback();
            }
        });
    },

    //******************************************************************************************************************
    saveKioskMessage: function(kioskMessageHeader, kioskMessageBody, callback){

        //aws doesn't support empty strings, so need to do some replacement
        if(kioskMessageHeader.length === 0){
            kioskMessageHeader = '~';
        }
        if(kioskMessageBody.length === 0){
            kioskMessageBody = '~';
        }


        loading("show",'check',"Saving",1000,false);


        var params = {
            TableName: 'iqCustomerLocations',
            Key: { customerID : globals.customer.customerID, locationID : globals.theLocationID },

            UpdateExpression: "set kioskMessageHeader = :kmh, kioskMessageBody=:kmb",
            ExpressionAttributeValues:{
                ":kmh":kioskMessageHeader,
                ":kmb":kioskMessageBody
            }
        };

        this.dynamodbEast.update(params, function(err, data) {

            console.log('tried to update kiosk message and err= ' + err);

            if (err){
                console.log(err);
                callback();
            }
            else {
                console.log(data);
                callback();
            }
        });



    },

    //******************************************************************************************************************
    updateMachineInfo: function(){
        //save the info about this machine so we can understand our deployed profile


        //let's figure out this machine's ID or create one if this is the first time
        var machineID = $.jStorage.get('machineID');
        if(!machineID){
            machineID = cobaltfireUtils.guid();
            $.jStorage.set('machineID', machineID);
        }

        //we now have a machineID for this machine

        //console.log(machineID);

        var now = cobaltfireUtils.calibratedDateTime();

        //figure out which configuration is running
        if(globals.isBackend){
            var launchConfiguration = 'Backend';
            var version = globals.appVersion;
        }
        if(globals.isKiosk){
            launchConfiguration = 'Kiosk';
            version = globals.version_Kiosk;
        }
        if(globals.isDisplay){
            launchConfiguration = 'Display';
            version = globals.version_Display;
        }

        //figure out who the user is
        if(susi.theUser){
            currentUser = susi.theUser.first + ' ' + susi.theUser.last;
        }
        else{
            currentUser = 'No User';
        }

        if(globals.customer){
            var customerID = globals.customer.customerID;
        }

        if(!customerID){
            customerID = 'Have not moved to AWS yet';
        }

        //figure out the display dimensions
        var screenWidth = window.screen.width;
        var screenHeight = window.screen.height;

        //figure out the size of the viewport
        var viewportH = verge.viewportH();
        var viewportW = verge.viewportW();

        var params = {
            TableName: 'iqMachineInfo',
            Key: { machineID : machineID },
            UpdateExpression: "set updateTime = :udt, customerID=:cid, launchConfiguration=:lc, version=:v, currentUser=:cu, screenWidth=:sw, screenHeight=:sh, viewportW=:vpw, viewportH=:vph ",
            ExpressionAttributeValues:{
                ":udt": now.getTime(),
                ":cid": customerID,
                ":lc": launchConfiguration,
                ":v": version,
                ":cu": currentUser,
                ":sw": screenWidth,
                ":sh": screenHeight,
                ":vpw": viewportW,
                ":vph": viewportH
            }
        };

        this.dynamodbEast.update(params, function(err, data) {
            //console.log('tried to update iqMachineInfo and err= ' + err);

            if (err){
                console.log(err);
            }
            else {
                //console.log(data);
            }
        });


    },

    //******************************************************************************************************************
    trackTraffic: function(state, signonsource){

        //figure out the Date (zerod to 12am) and the Hour

        var now = cobaltfireUtils.calibratedDateTime();

        var theHour = now.getHours();

        //get rid of hours, minutes, seconds, milliseconds
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);

        //and get theDate in milliseconds since epoch
        var theDate = now.getTime();

        //create an object to hold all the info
        var dailyTraffic = {};

        dailyTraffic.theDate = theDate;
        dailyTraffic.locationID = globals.theLocationID;

        if(state === "Closed"){
            dailyTraffic.closed = 1;
            dailyTraffic.noShow = 0;
        }
        else{
            dailyTraffic.closed = 0;
            dailyTraffic.noShow = 1;
        }

        if(signonsource === "kiosk"){
            dailyTraffic.kiosk = 1;
            dailyTraffic.mobile = 0;
        }
        else{
            dailyTraffic.kiosk = 0;
            dailyTraffic.mobile = 1;
        }

        dailyTraffic.hour0 = (theHour === 0 ? 1 : 0);
        dailyTraffic.hour1 = (theHour === 1 ? 1 : 0);
        dailyTraffic.hour2 = (theHour === 2 ? 1 : 0);
        dailyTraffic.hour3 = (theHour === 3 ? 1 : 0);
        dailyTraffic.hour4 = (theHour === 4 ? 1 : 0);
        dailyTraffic.hour5 = (theHour === 5 ? 1 : 0);
        dailyTraffic.hour6 = (theHour === 6 ? 1 : 0);
        dailyTraffic.hour7 = (theHour === 7 ? 1 : 0);
        dailyTraffic.hour8 = (theHour === 8 ? 1 : 0);
        dailyTraffic.hour9 = (theHour === 9 ? 1 : 0);
        dailyTraffic.hour10 = (theHour === 10 ? 1 : 0);
        dailyTraffic.hour11 = (theHour === 11 ? 1 : 0);
        dailyTraffic.hour12 = (theHour === 12 ? 1 : 0);
        dailyTraffic.hour13 = (theHour === 13 ? 1 : 0);
        dailyTraffic.hour14 = (theHour === 14 ? 1 : 0);
        dailyTraffic.hour15 = (theHour === 15 ? 1 : 0);
        dailyTraffic.hour16 = (theHour === 16 ? 1 : 0);
        dailyTraffic.hour17 = (theHour === 17 ? 1 : 0);
        dailyTraffic.hour18 = (theHour === 18 ? 1 : 0);
        dailyTraffic.hour19 = (theHour === 19 ? 1 : 0);
        dailyTraffic.hour20 = (theHour === 20 ? 1 : 0);
        dailyTraffic.hour21 = (theHour === 21 ? 1 : 0);
        dailyTraffic.hour22 = (theHour === 22 ? 1 : 0);
        dailyTraffic.hour23 = (theHour === 23 ? 1 : 0);

        //see if we already have an entry for today in the DailyTraffic table

        var params = {
            TableName: 'DailyTraffic',
            KeyConditionExpression: 'locationID = :locationID and theDate = :theDate ',
            ExpressionAttributeValues: {
                ':locationID': globals.theLocationID,
                ':theDate': theDate
            }
        };

        this.dynamodbEast.query(params, function(err, data) {

            //console.log('returned from fetchWaitTime with err= ' + err);

            if (err){
                //if an error occured, we'll just live without that data point
                //TODO Add some error tracking into keen.io so we'll know if errors are happening
            }
            else {
                // successful response

                if(data.Count === 0){
                    //there is not already an entry for today in the table
                    //so create one
                    params = {
                        TableName: 'DailyTraffic',
                        Key: { locationID : globals.theLocationID, theDate: theDate },
                        UpdateExpression: "set closed = :closed, " +
                        "noShow=:noShow, " +
                        "kiosk=:kiosk, " +
                        "mobile=:mobile, " +
                        "hour0=:hour0, " +
                        "hour1=:hour1, " +
                        "hour2=:hour2, " +
                        "hour3=:hour3, " +
                        "hour4=:hour4, " +
                        "hour5=:hour5, " +
                        "hour6=:hour6, " +
                        "hour7=:hour7, " +
                        "hour8=:hour8, " +
                        "hour9=:hour9, " +
                        "hour10=:hour10, " +
                        "hour11=:hour11, " +
                        "hour12=:hour12, " +
                        "hour13=:hour13, " +
                        "hour14=:hour14, " +
                        "hour15=:hour15, " +
                        "hour16=:hour16, " +
                        "hour17=:hour17, " +
                        "hour18=:hour18, " +
                        "hour19=:hour19, " +
                        "hour20=:hour20, " +
                        "hour21=:hour21, " +
                        "hour22=:hour22, " +
                        "hour23=:hour23 ",
                        ExpressionAttributeValues:{
                            ":closed": dailyTraffic.closed,
                            ":noShow": dailyTraffic.noShow,
                            ":kiosk": dailyTraffic.kiosk,
                            ":mobile": dailyTraffic.mobile,
                            ":hour0": dailyTraffic.hour0,
                            ":hour1": dailyTraffic.hour1,
                            ":hour2": dailyTraffic.hour2,
                            ":hour3": dailyTraffic.hour3,
                            ":hour4": dailyTraffic.hour4,
                            ":hour5": dailyTraffic.hour5,
                            ":hour6": dailyTraffic.hour6,
                            ":hour7": dailyTraffic.hour7,
                            ":hour8": dailyTraffic.hour8,
                            ":hour9": dailyTraffic.hour9,
                            ":hour10": dailyTraffic.hour10,
                            ":hour11": dailyTraffic.hour11,
                            ":hour12": dailyTraffic.hour12,
                            ":hour13": dailyTraffic.hour13,
                            ":hour14": dailyTraffic.hour14,
                            ":hour15": dailyTraffic.hour15,
                            ":hour16": dailyTraffic.hour16,
                            ":hour17": dailyTraffic.hour17,
                            ":hour18": dailyTraffic.hour18,
                            ":hour19": dailyTraffic.hour19,
                            ":hour20": dailyTraffic.hour20,
                            ":hour21": dailyTraffic.hour21,
                            ":hour22": dailyTraffic.hour22,
                            ":hour23": dailyTraffic.hour23
                        }
                    };

                    awsConnector.dynamodbEast.update(params, function(err, data) {

                        //console.log('returned from aws call with err= ' + err);

                        if (err){
                            //if an error occurred, we'll just live without that data point
                            //TODO Add some error tracking into keen.io so we'll know if errors are happening
                        }
                        else {
                            // successful response
                            //nothing to do but be happy
                        }
                    });

                }
                else{
                    //there is already an entry for today in the table
                    //so increment the values
                    params = {
                        TableName: 'DailyTraffic',
                        Key: { locationID : globals.theLocationID, theDate: theDate },
                        UpdateExpression: "set closed = :closed, " +
                        "noShow=:noShow, " +
                        "kiosk=:kiosk, " +
                        "mobile=:mobile, " +
                        "hour0=:hour0, " +
                        "hour1=:hour1, " +
                        "hour2=:hour2, " +
                        "hour3=:hour3, " +
                        "hour4=:hour4, " +
                        "hour5=:hour5, " +
                        "hour6=:hour6, " +
                        "hour7=:hour7, " +
                        "hour8=:hour8, " +
                        "hour9=:hour9, " +
                        "hour10=:hour10, " +
                        "hour11=:hour11, " +
                        "hour12=:hour12, " +
                        "hour13=:hour13, " +
                        "hour14=:hour14, " +
                        "hour15=:hour15, " +
                        "hour16=:hour16, " +
                        "hour17=:hour17, " +
                        "hour18=:hour18, " +
                        "hour19=:hour19, " +
                        "hour20=:hour20, " +
                        "hour21=:hour21, " +
                        "hour22=:hour22, " +
                        "hour23=:hour23 ",
                        ExpressionAttributeValues:{
                            ":closed": data.Items[0].closed + dailyTraffic.closed,
                            ":noShow": data.Items[0].noShow + dailyTraffic.noShow,
                            ":kiosk": data.Items[0].kiosk + dailyTraffic.kiosk,
                            ":mobile": data.Items[0].mobile + dailyTraffic.mobile,
                            ":hour0": data.Items[0].hour0 + dailyTraffic.hour0,
                            ":hour1": data.Items[0].hour1 + dailyTraffic.hour1,
                            ":hour2": data.Items[0].hour2 + dailyTraffic.hour2,
                            ":hour3": data.Items[0].hour3 + dailyTraffic.hour3,
                            ":hour4": data.Items[0].hour4 + dailyTraffic.hour4,
                            ":hour5": data.Items[0].hour5 + dailyTraffic.hour5,
                            ":hour6": data.Items[0].hour6 + dailyTraffic.hour6,
                            ":hour7": data.Items[0].hour7 + dailyTraffic.hour7,
                            ":hour8": data.Items[0].hour8 + dailyTraffic.hour8,
                            ":hour9": data.Items[0].hour9 + dailyTraffic.hour9,
                            ":hour10": data.Items[0].hour10 + dailyTraffic.hour10,
                            ":hour11": data.Items[0].hour11 + dailyTraffic.hour11,
                            ":hour12": data.Items[0].hour12 + dailyTraffic.hour12,
                            ":hour13": data.Items[0].hour13 + dailyTraffic.hour13,
                            ":hour14": data.Items[0].hour14 + dailyTraffic.hour14,
                            ":hour15": data.Items[0].hour15 + dailyTraffic.hour15,
                            ":hour16": data.Items[0].hour16 + dailyTraffic.hour16,
                            ":hour17": data.Items[0].hour17 + dailyTraffic.hour17,
                            ":hour18": data.Items[0].hour18 + dailyTraffic.hour18,
                            ":hour19": data.Items[0].hour19 + dailyTraffic.hour19,
                            ":hour20": data.Items[0].hour20 + dailyTraffic.hour20,
                            ":hour21": data.Items[0].hour21 + dailyTraffic.hour21,
                            ":hour22": data.Items[0].hour22 + dailyTraffic.hour22,
                            ":hour23": data.Items[0].hour23 + dailyTraffic.hour23
                        }
                    };

                    awsConnector.dynamodbEast.update(params, function(err, data) {

                        //console.log('returned from aws call with err= ' + err);

                        if (err){
                            //if an error occurred, we'll just live without that data point
                            //TODO Add some error tracking into keen.io so we'll know if errors are happening
                        }
                        else {
                            // successful response
                            //nothing to do but be happy
                        }
                    });

                }


            }
        });



    },

    //******************************************************************************************************************
    trackHeartbeat: function(endpointType){

        var now = new Date();

        if(now.getTime() - awsConnector.lastHeartbeat.getTime() < 1000*60*5){
            //console.log('not enough time has elapsed');
            return;
        }


        switch(endpointType) {
            case 'Kiosk':
                var version = globals.version_Kiosk;
                break;
            case 'Display':
                version = globals.version_Display;
                break;
            case 'Backend':
                version = globals.appVersion;
                break;
            default:
                version = 0;
        }

        awsConnector.lastHeartbeat = new Date();

        var params = {
            TableName : 'iqHeartbeat',
            Item: {

                customerID: globals.customer.customerID,
                createTime: cobaltfireUtils.calibratedDateTime().getTime(),

                locationID: globals.theLocationID,
                endpointType: endpointType,
                version: version,
                minutesSinceLoad: Math.round((now.getTime() - globals.endpointLoadTime.getTime())/60/1000)

            }
        };


        this.dynamodbEast.put(params, function(err, data) {
            //console.log('err= ' + err);
            if (err){
                //console.log(err);

            }
            else{
                //console.log(data);
            }

        });


    },

    //******************************************************************************************************************
    fetchDailyTraffic: function(startDate, endDate, locationID, callback){

        var params = {
            TableName: 'DailyTraffic',
            KeyConditionExpression: 'locationID = :locationID and theDate BETWEEN :startDate AND :endDate ',
            ExpressionAttributeValues: {
                ':locationID': locationID,
                ':startDate': startDate.getTime(),
                ':endDate': endDate.getTime()
            }
        };


        this.dynamodbEast.query(params, function(err, data) {

            //console.log('dailyTraffic returned with err= ' + err);

            if (err){
                //console.log(err); // an error occurred

            }
            else {
                // successful response
                callback(data.Items);
            }
        });


    },

    //******************************************************************************************************************
    searchStudent: function(locationID, firstNameLC, lastNameLC, callback){


        var params = {
            TableName: 'iqClosedQueue',
            IndexName: 'locationID-lastNameLC-index',
            KeyConditionExpression: 'locationID = :locationID and begins_with (lastNameLC, :lastNameLC )',
            FilterExpression : 'contains (firstNameLC, :firstNameLC)',
            ExpressionAttributeValues : {
                ':locationID': locationID,
                ':lastNameLC' : lastNameLC,
                ':firstNameLC' : firstNameLC
            }
        };



        if(firstNameLC.length === 0){
            params = {
                TableName: 'iqClosedQueue',
                IndexName: 'locationID-lastNameLC-index',
                KeyConditionExpression: 'locationID = :locationID and begins_with (lastNameLC, :lastNameLC )',
                ExpressionAttributeValues : {
                    ':locationID': locationID,
                    ':lastNameLC' : lastNameLC
                }
            };
        }


        this.dynamodbEast.query(params, function(err, data) {
            //console.log('query returned: '+  err);
            if (err){
                callback();
            }
            else {
                //console.log(data);
                callback(data.Items);
            }
        });




    },

    //******************************************************************************************************************
    updateClosedQueueComment: function(locationID, createTime, newComment, callback){

        var params = {
            TableName: 'iqClosedQueue',
            Key: { locationID : locationID, createTime: Number(createTime) },
            UpdateExpression: "set comments=:comments",
            ExpressionAttributeValues:{
                ":comments": newComment
            },
            ReturnValues: "ALL_NEW"
        };

        this.dynamodbEast.update(params, function(err, data) {
            //console.log('update returned: '+  err);
            if (err){
                //console.log(err); // an error occurred
                callback(false);
            }
            else {
                //console.log(data);
                callback(true);
            }
        });
    },

    //******************************************************************************************************************
    fetchMyStudents: function(agentName, startDate, endDate, locationID, callback){

        if(agentName === 'Everyone '){
            var params = {
                TableName: 'iqClosedQueue',
                KeyConditionExpression: 'locationID = :locationID and createTime BETWEEN :startTime AND :endTime ',
                ExpressionAttributeValues: {
                    ':locationID': locationID,
                    ':startTime': startDate.getTime(),
                    ':endTime': endDate.getTime()
                }
            };
        }
        else{
            params = {
                TableName: 'iqClosedQueue',
                KeyConditionExpression: 'locationID = :locationID and createTime BETWEEN :startTime AND :endTime ',
                FilterExpression : 'closedBy = :agentName',
                ExpressionAttributeValues: {
                    ':locationID': locationID,
                    ':startTime': startDate.getTime(),
                    ':endTime': endDate.getTime(),
                    ':agentName': agentName
                }
            };
        }

        this.dynamodbEast.query(params, function(err, data) {
            //console.log('query returned: '+  err);
            if (err){
                callback();
            }
            else {
                //console.log(data);
                callback(data.Items);
            }
        });


    },

    //******************************************************************************************************************
    saveTouchPoint: function(locationID, newTouchPoint, callback){

        newTouchPoint.locationID = locationID;
        newTouchPoint.createTime = cobaltfireUtils.calibratedDateTime().getTime();

        var params = {
            TableName : 'iqTouchPoints',
            Item: newTouchPoint
        };


        this.dynamodbEast.put(params, function(err, data) {
            if (err){
                callback(false);
            }
            else{
                callback(true);
            }


        });

    },

    //******************************************************************************************************************
    fetchQuestionsTouchPoints: function(questionObjectID, callback){

        var params = {
            TableName: 'iqTouchPoints',
            IndexName: 'questionObjectID-index',
            KeyConditionExpression: 'questionObjectID = :questionObjectID',
            ExpressionAttributeValues: {
                ':questionObjectID': questionObjectID
            }
        };

        this.dynamodbEast.query(params, function(err, data) {
            //console.log('query returned: '+  err);
            if (err){
                callback();
            }
            else {
                //console.log(data);
                callback(data.Items);
            }
        });

    },

    //******************************************************************************************************************
    fetchTouchPointsReport: function(locationID, startDate, endDate, callback, ExclusiveStartKey){

        var params = {
            TableName: 'iqTouchPoints',
            KeyConditionExpression: 'locationID = :locationID and createTime BETWEEN :startTime AND :endTime ',
            ExpressionAttributeValues: {
                ':locationID': locationID,
                ':startTime': startDate.getTime(),
                ':endTime': endDate.getTime()
            },
            ExclusiveStartKey: ExclusiveStartKey
        };

        awsConnector.dynamodbEast.query(params, function(err, data) {
            //console.log('query returned: '+  err);
            if (err){
                callback();
            }
            else {
                //console.log(data);
                callback(data.Items, data.LastEvaluatedKey, startDate, endDate );
            }
        });

    },

    //******************************************************************************************************************
    deleteTouchPoint: function(createTime, callback){

        var params = {
            TableName : 'iqTouchPoints',
            Key: {
                locationID: globals.theLocationID,
                createTime: Number(createTime)
            }
        };

        this.dynamodbEast.delete(params, function(err, data) {
            //console.log('delete returned: '+  err);
            if (err){
                console.log('Error deleting touchpoint from AWS: ' + err);
               callback();
            }
            else{
                callback();
            }
        });
    },

    //******************************************************************************************************************
    fetchAgentMetricsReport: function(locationID, startDate, endDate, callback, ExclusiveStartKey){

        var params = {
            TableName: 'iqClosedQueue',
            KeyConditionExpression: 'locationID = :locationID and createTime BETWEEN :startTime AND :endTime ',
            ExpressionAttributeValues: {
                ':locationID': locationID,
                ':startTime': startDate.getTime(),
                ':endTime': endDate.getTime()
            },
            ExclusiveStartKey: ExclusiveStartKey
        };

        awsConnector.dynamodbEast.query(params, function(err, data) {
            //console.log('query returned: '+  err);
            if (err){
                callback();
            }
            else {
                //console.log(data);
                callback(data.Items, data.LastEvaluatedKey, startDate, endDate );
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

        awsConnector.dynamodbEast.query(params, function(err, data) {
            //console.log('query returned: '+  err);
            if (err){
                callback();
            }
            else {
                //console.log(data);
                callback(data.Items);
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

        this.dynamodbEast.update(params, function(err, data) {

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
    deleteDisplaySlide: function(messageID, callback){

        var params = {
            TableName : 'iqDisplayMessages',
            Key: {
                locationID: globals.theLocationID,
                messageID: messageID
            }
        };

        this.dynamodbEast.delete(params, function(err, data) {
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
    saveNotification: function (locationID, notificationObject, callback) {

        var params = {
            TableName : 'iqNotificationQueue',
            Item: {

                locationID: locationID,
                notificationID: cobaltfireUtils.guid(),

                notificationObject: notificationObject

            }
        };

        this.dynamodbEast.put(params, function(err, data) {
            //console.log('err= ' + err);
            if (err){
                //console.log(err);
                callback(false);
            }
            else{
                //console.log(data);
                callback(true);
            }

        });

    },

    //******************************************************************************************************************
    fetchNotifications: function(locationID, callback){

        var params = {
            TableName: 'iqNotificationQueue',
            KeyConditionExpression: 'locationID = :locationID ',
            ExpressionAttributeValues: {
                ':locationID': locationID
            }
        };

        awsConnector.dynamodbEast.query(params, function(err, data) {
            //console.log('query returned: '+  err);
            if (err){
                callback();
            }
            else {
                //console.log(data);
                callback(data.Items);
            }
        });
    },

    //******************************************************************************************************************
    deleteNotification: function (locationID, notificationID) {

        var params = {
            TableName : 'iqNotificationQueue',
            Key: {
                locationID: locationID,
                notificationID: notificationID
            }
        };

        this.dynamodbEast.delete(params, function(err, data) {
            //console.log('delete returned: '+  err);
            if (err){

            }
            else{

            }
        });

    },

    //******************************************************************************************************************
    updateNotification: function (theNotification) {
        var params = {
            TableName: 'iqNotificationQueue',
            Key: { locationID : theNotification.locationID, notificationID : theNotification.notificationID },

            UpdateExpression: "set notificationObject = :notificationObject",
            ExpressionAttributeValues:{
                ":notificationObject":theNotification.notificationObject
            }
        };

        this.dynamodbEast.update(params, function(err, data) {

            //console.log('tried to update display slide and err= ' + err);

            if (err){
                //console.log(err);
                console.log(err);
            }
            else {
                //console.log(data);

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
    },

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


    }

    //******************************************************************************************************************
    //******************************************************************************************************************
    //******************************************************************************************************************
};
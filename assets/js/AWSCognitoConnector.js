/**
 * Created by bgager on 5/14/17.
 */

var awsCognitoConnector = {

    /*example code here: https://github.com/aws/amazon-cognito-identity-js/*/
    /*http://docs.aws.amazon.com/cognito/latest/developerguide/using-amazon-cognito-user-identity-pools-javascript-examples.html*/


    poolData : {
        UserPoolId : 'us-east-1_wyNTdwsWZ', // Your user pool id here
        ClientId : '1ld94fgjf20na6mv5chdk3haes' // Your client id here
    },

    cognitoUser: {},

    dynamodbEast: null,
    IdentityPoolId: 'us-east-1:f769f5d7-6530-4e45-a689-27226bb6d05e',


    //******************************************************************************************************************
    registerNewUser: function (email, role, username, guidusername, password, customerID, callback) {


        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(awsCognitoConnector.poolData);

        var attributeList = [];

        var dataEmail = {
            Name : 'email',
            Value : email
        };
        var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
        attributeList.push(attributeEmail);

        var dataRole = {
            Name : 'custom:iqueue_role',
            Value : role
        };
        var attributeRole = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataRole);
        attributeList.push(attributeRole);

        var dataCustomerID = {
            Name : 'custom:iqueue_customerid',
            Value : customerID
        };
        var attributeCustomerID = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataCustomerID);
        attributeList.push(attributeCustomerID);

        var dataguidUserName = {
            Name : 'custom:iqueue_guidusername',
            Value : guidusername
        };
        var attributeguidUserName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataguidUserName);
        attributeList.push(attributeguidUserName);

        userPool.signUp(username, password, attributeList, null, function(err, result){
            if (err) {
                callback(false, err.message);
                return;
            }
            callback(true, result.user );
        });

    },

    //*****************************************************************************************************************
    resendVerificationCode: function (cognitoUser, callback) {
        cognitoUser.resendConfirmationCode(function(err, result) {
            if (err) {
                callback(false, err);
                return;
            }
            callback(true, result);
        });
    },

    //******************************************************************************************************************
    verifyNewUser: function (username, verificationCode, callback) {

        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(awsCognitoConnector.poolData);
        var userData = {
            Username : username,
            Pool : userPool
        };

        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        cognitoUser.confirmRegistration(verificationCode, true, function(err, result) {
            if (err) {
                callback(false, err);
                return;
            }
            callback(true, result);
        });

    },

    //******************************************************************************************************************
    signInUser: function (username, password, callback) {
        var authenticationData = {
            Username : username,
            Password : password
        };
        var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);

        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(awsCognitoConnector.poolData);
        var userData = {
            Username : username,
            Pool : userPool
        };
        awsCognitoConnector.cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        awsCognitoConnector.cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {

                awsCognitoConnector.cognitoUser.getUserAttributes(function(err, result2) {
                    if (err) {
                        callback(false,err);
                        return;
                    }

                    //user successfully authenticated, so initialize authenticated AWS connection
                    AWS.config.region = 'us-east-1';

                    var creds = new AWS.CognitoIdentityCredentials({
                        IdentityPoolId: awsCognitoConnector.IdentityPoolId, // your identity pool id here
                        RoleArn: 'arn:aws:iam::421021106781:role/Cognito_iqueueAuth_Role',
                        Logins: {
                            // Change the key below according to the specific region your user pool is in.
                            'cognito-idp.us-east-1.amazonaws.com/us-east-1_wyNTdwsWZ': result.getIdToken().getJwtToken()
                        }
                    });

                    AWS.config.credentials = creds;

                    //usefull for troubleshooting if the connection is failing
                    /*                AWS.config.credentials.get(function(err){
                     if (err) {
                     alert(err);
                     }
                     });*/

                    // Instantiate AWS sdk service objects now that the credentials have been updated.
                    awsCognitoConnector.dynamodbEast = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

                    //AWS authenticated access setup, so go back to the app
                    callback(true, result, result2);

                });
            },

            onFailure: function(err) {
                callback(false,err);
            },

            newPasswordRequired: function (userAttributes, requiredAttributes) {
               callback(false, 'newPasswordRequired');
            }

        });
    },

    //******************************************************************************************************************
    forcedPasswordReset: function (newPassword, attributesData, callback) {

        awsCognitoConnector.cognitoUser.completeNewPasswordChallenge(newPassword, attributesData, {
            onSuccess: function(result) {

                callback(true,result);

            },
            onFailure: function(error) {
                callback(false,error);
            }
        })
    },

    //******************************************************************************************************************
    forgotPassword: function (username, callback) {

        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(awsCognitoConnector.poolData);
        var userData = {
            Username : username,
            Pool : userPool
        };
        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        cognitoUser.forgotPassword({
            onSuccess: function () {
                // successfully initiated reset password request

            },
            onFailure: function(err) {
                callback(false, err);
            },
            //Optional automatic callback
            inputVerificationCode: function(data) {

                callback(true, data.CodeDeliveryDetails.Destination);

                /*                console.log('Code sent to: ' + data);
                 var verificationCode = prompt('Please input verification code ' ,'');
                 var newPassword = prompt('Enter new password ' ,'');
                 cognitoUser.confirmPassword(verificationCode, newPassword, this);*/
            }
        });
    },

    //******************************************************************************************************************
    resetPasswordVerificationCode: function (username, verificationCode, newPassword, callback) {

        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(awsCognitoConnector.poolData);
        var userData = {
            Username : username,
            Pool : userPool
        };
        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        cognitoUser.confirmPassword(verificationCode, newPassword, {
            onFailure: function(err) {
                //console.log(err);
                callback(false, err);
            },
            onSuccess: function() {
                //console.log("Password Reset Success");
                callback(true);
            }
        });

    },

    //******************************************************************************************************************
    fetchAuthConfig: function (callback) {

        var params = {
            TableName: 'iq_authenticated_configuration',
            KeyConditionExpression: 'application = :appkey ',
            ExpressionAttributeValues: {
                ':appkey': 'iQueue'
            }
        };

        awsCognitoConnector.dynamodbEast.query(params, function (err, data) {

            if (err) {
                console.log(err); // an error occurred
                callback(false, err);

            }
            else {
                // successful response
                callback(true, data.Items[0] );
            }
        });

    }

};
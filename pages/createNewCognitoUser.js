/**
 * Created by bgager on 6/5/17.
 */

var newCognitoUserPage = {

    userInformation: {},
    cognitoUser: null,


    //******************************************************************************************************************

    render: function (user) {

        globals.currentPage = 'newCognitoUserPage';

        newCognitoUserPage.userInformation.role = user.role;
        newCognitoUserPage.userInformation.customerID = user.customerID;
        newCognitoUserPage.userInformation.guidUserName = user.userGUID;

        $('#authenticatedContent').hide().load("pages/createNewCognitoUser.html?version="+ globals.version, function() {

            $('#signup-email').val(user.email);

        }).fadeIn('1000');

    },

    //*****************************************************************************************************************
    signUpUser: function () {

        //remove any spaces from the Username input
        $('#signup-username').val($('#signup-username').val().replace(/\s+/g, ''));

        //and convert it to lowercase
        $('#signup-username').val($('#signup-username').val().toLowerCase());

        //make sure they entered a Username
        if ($('#signup-username').val().length === 0 ){
            var options = {};
            options.title = 'Missing Information!';
            options.message = "Please enter a Username";
            options.callback = function () {
                $('#signup-username').focus();
            };
            modalMessage.showMessage(options);
            return;
        }

        //make sure they entered a Password
        if ($('#signup-password').val().length < 8 ){
            options = {};
            options.title = 'Invalid Password!';
            options.message = "Please make sure your password is at least 8 characters";
            options.callback = function () {
                $('#signup-password').focus();
            };
            modalMessage.showMessage(options);
            return;
        }

        //make sure the passwords match
        if($('#signup-password').val() !== $('#signup-password-confirm').val()){
            options = {};
            options.title = "Passwords Don't Match!";
            options.message = "Please make sure your password is entered correctly twice";
            options.callback = function () {
                $('#signup-password-confirm').focus();
            };
            modalMessage.showMessage(options);
            return;
        }

        //ok, everything seems to have been entered ok

        utils.activeButton('userAccountCreateBTN','Creating Account');

        newCognitoUserPage.userInformation.email = $('#signup-email').val();
        newCognitoUserPage.userInformation.username = $('#signup-username').val();
        newCognitoUserPage.userInformation.password = $('#signup-password').val();

        awsCognitoConnector.registerNewUser(newCognitoUserPage.userInformation.email, newCognitoUserPage.userInformation.role, newCognitoUserPage.userInformation.username, newCognitoUserPage.userInformation.guidUserName, newCognitoUserPage.userInformation.password, newCognitoUserPage.userInformation.customerID, newCognitoUserPage.registerNewUserReturned);

    },

    //******************************************************************************************************************
    registerNewUserReturned: function (success, data) {
        if (!success){
            //there was some kind of error
            if (data === 'User already exists'){
                var options = {};
                options.title = "Username Already Taken!";
                options.message = "Sorry, that Username has already been registered by someone else.<br>Please pick a different Username.";
                options.size = 'large';
                options.callback = function () {
                    $('#signup-username').focus();
                };
                modalMessage.showMessage(options);
                return;
            }
            else {
                options = {};
                options.title = "Oops, there was a problem!";
                options.message = data;
                options.callback = function () {

                };
                modalMessage.showMessage(options);
                return;
            }
        }

        //user created successfully
        //save the cognitio user locally so we can use it later if needed
        newCognitoUserPage.cognitoUser = data;

         var newUserHTML = '' +
            '<span class="text-primary-darkend font-weight-bold">Username:</span><span class="text-primary"> ' + newCognitoUserPage.userInformation.username + '</span><br>' +
            '<span class="text-primary-darkend font-weight-bold">Email:</span><span class="text-primary"> ' + newCognitoUserPage.userInformation.email + '</span>';

        $('#content').hide().load("pages/new_account_verification.html?version=" + globals.version, function() {


            $('#newAccountInformation').html(newUserHTML);

        }).fadeIn('1000');
    },

    //*****************************************************************************************************************
    verifyUser: function () {

        //remove any spaces from the verification code input
        $('#signup-account-verification-code').val($('#signup-account-verification-code').val().replace(/\s+/g, ''));

        //make sure they entered a verification code
        if ($('#signup-account-verification-code').val().length === 0){
            var options = {};
            options.title = "Missing Verification Code";
            options.message = "Please enter a Verification Code before clicking Verify Account";
            options.callback = function () {
                $('#signup-account-verification-code').focus();
            };
            modalMessage.showMessage(options);
            return;
        }

        utils.activeButton('userAccountVerifyBTN','Verifying Account');

        //ok, we have a verfication code so...
        awsCognitoConnector.verifyNewUser(newCognitoUserPage.cognitoUser.username, $('#signup-account-verification-code').val(),newCognitoUserPage.verifyNewUserReturned);

    },

    //*****************************************************************************************************************
    verifyNewUserReturned: function (success, data) {

        if (!success){

            var options = {};
            options.title = "Verification Code Error";
            //TODO various errors could be returned, so we could provide finer grain messaging as to what went wrong
            options.message = 'That Verification Code is incorrect.<br>Please try again';
            options.callback = function () {
                $('#signup-account-verification-code').focus();
            };
            modalMessage.showMessage(options);
            return;

        }

        var newUserHTML = '' +
            '<span class="text-primary-darkend font-weight-bold">Username:</span><span class="text-primary"> ' + newCognitoUserPage.userInformation.username + '</span><br>' +
            '<span class="text-primary-darkend font-weight-bold">Email:</span><span class="text-primary"> ' + newCognitoUserPage.userInformation.email + '</span>';

        $('#content').hide().load("pages/new_account_verified.html?version=" + globals.version, function() {


            $('#newAccountInformation').html(newUserHTML);

        }).fadeIn('1000');

    },

    //*****************************************************************************************************************
    resendVerificationCode: function () {
        awsCognitoConnector.resendVerificationCode(newCognitoUserPage.cognitoUser, newCognitoUserPage.verficationCodeSent);
    },

    //*****************************************************************************************************************
    verficationCodeSent: function (success, data) {

        if (success){
            var options = {};
            options.title = "Code Sent";
            options.message = "We've sent a new Verification Code to you.<br>Please use this new code to verify your account.";
            options.callback = function () {

            };
            modalMessage.showMessage(options);
            return;
        }

        options = {};
        options.title = "Something Went Terribly Wrong!";
        options.message = 'Please try again.<br>' + data.message;
        options.callback = function () {

        };
        modalMessage.showMessage(options);

    },

    //******************************************************************************************************************
    reloadiQueue: function () {


        window.open('index_secure.htm?version=' + globals.version, '_self');


    }

    //******************************************************************************************************************


};
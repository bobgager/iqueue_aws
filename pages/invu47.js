/**
 * Created by bgager on 6/5/17.
 */

var invitationPage = {

    customerID: null,
    userLastNameLC: null,
    failedAttempts: 0,

    configure: function (customerID) {

        invitationPage.customerID = customerID;

        var progress = 0;
        var scripts = ['assets/js/AWSDynamoDBConnector.js?version='+globals.version];
        scripts.forEach(function(script) {
            $.getScript(script, function () {
                if (++progress == scripts.length) invitationPage.render();
            });
        });

    },

    //******************************************************************************************************************
    render: function () {

        router.currentPage = 'invitationPage';

        $('#authenticatedContent').hide().load("pages/invu47.html?version="+ globals.version, function() {

            invitationPage.failedAttempts = 0;

        }).fadeIn('1000');

    },

    //******************************************************************************************************************
    confirmInvitation: function () {

        var invitationCode = $('#invitation-code-input').val();
        invitationPage.userLastNameLC = $('#invitation-lastname-input').val().toLowerCase();

        if (invitationCode.length === 0){
            var options = {};
            options.title = 'Empty Invitation Code';
            options.message = "Please enter an Invitation Code." ;
            options.buttonName = 'OK';
            options.callback = function () {
                $('#invitation-code-input').focus();
            };
            modalMessage.showMessage(options);

            return;
        }

        if (invitationPage.userLastNameLC.length === 0){
            var options = {};
            options.title = 'Empty Last Name';
            options.message = "Please enter your Last Name." ;
            options.buttonName = 'OK';
            options.callback = function () {
                $('#invitation-lastname-input').focus();
            };
            modalMessage.showMessage(options);

            return;
        }

        awsDynamoDBConnector.fetchSingleUser(invitationPage.customerID, invitationCode, invitationPage.fetchSingleUserReturned);


    },

    //******************************************************************************************************************
    fetchSingleUserReturned: function (success, data) {

        if (!success){
            //there was an error reading the user table

            invitationPage.failedAttempts ++;

            if (invitationPage.failedAttempts > 2){
                utils.fatalError('fsur001', data)
            }
            else {
                awsDynamoDBConnector.fetchSingleUser(invitationPage.customerID, $('#invitation-code-input').val(), invitationPage.fetchSingleUserReturned);
            }



            return;
        }

        if (!data){
            //we read the database, but didn't get a user match
            var options = {};
            options.title = 'Incorrect Invitation Code';
            options.message = "We're sorry, but that Invitation Code doesn't seem to be correct. <br>Please try again." ;
            options.buttonName = 'OK';
            options.callback = function () {
                $('#invitation-code-input').focus();
            };
            modalMessage.showMessage(options);

        }
        else {
            //we got a user in data

            //make sure the last name is a match
            if (data.lastName.toLowerCase() != invitationPage.userLastNameLC){
                //no match
                var options = {};
                options.title = 'Incorrect Last Name';
                options.message = "We're sorry, but that Last Name doesn't seem to match what we have on file. <br>Please try again." ;
                options.buttonName = 'OK';
                options.callback = function () {
                    $('#invitation-lastname-input').focus();
                };
                modalMessage.showMessage(options);

                return;
            }

            //everything seems to be a match

            //now, we need to let the user create a cognito account

            $.getScript('pages/createNewCognitoUser.js?version='+ globals.version, function () {
                newCognitoUserPage.render(data);
            });

        }

    }


};
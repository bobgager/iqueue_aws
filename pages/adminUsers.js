/**
 * Created by bgager on 5/23/17.
 */

var adminUsersPage = {

    userList: null,
    inviteGUID: null,

    //******************************************************************************************************************
    render:function () {

        jPM.close();

        globals.currentPage = 'adminUsersPage';


        //fetch the users for this customer
        awsDynamoDBConnector.fetchCustomerUserTable(globals.theCustomer.customerID, function (success, data) {

            if(success){

                adminUsersPage.userList = data;

                $('#authenticatedContent').hide().load("pages/adminUsers.html?version="+ globals.version, function() {

                    utils.writeDebug('adminUsersPage Page loaded',false);

                    $('#userList').fadeOut(1);
                    adminUsersPage.buildUserList();

                }).fadeIn('1000');

            }
            else {
                utils.fatalError('aur001', data);
            }
        });




    },

    //******************************************************************************************************************
    buildUserList: function () {

        $('#userList').fadeOut(1);

        var userListHTML = '';

        adminUsersPage.userList.forEach(function (user, index) {

            userListHTML += '' +
                '<div class="team-member">' +
                    '<div class="row">' +
                        '<div class="col-sm-2">' +
                            '<a href="team-member.htm" title="View ' + user.userDetails.firstName + '&#39;s profile">' +
                                '<img src="assets/img/generic-man-profile.jpg" class="img-thumbnail" alt="Jimi" />' +
                            '</a>' +
                        '</div>' +
                        '<div class="col-sm-10">' +
                            '<h4 class="name">' +
                                '<a href="team-member.htm" title="View ' + user.userDetails.firstName + '&#39;s profile">'+ user.userDetails.firstName + ' ' + user.userDetails.lastName +'</a>' +
                            '</h4>' +
                            '<p class="role">' + user.userDetails.role + '</p>' +
                            '<p>' + user.userDetails.email + '</p>' +
                            '<p>' + user.userDetails.status + '</p>' +
                        '</div>' +
                    '</div>' +
                '</div>'

        });

        if (userListHTML === ''){
            userListHTML = "You don't have any Team Members yet. <br>Click the Add Team Member button above to add your first Team Member."
        }

        $('#userList').html(userListHTML);

        $('#userList').fadeIn(5000);


    },

    //******************************************************************************************************************
    sendInvitationClick: function () {

        $('#newUserEmailInput').val($('#newUserEmailInput').val().toLowerCase());
        var newUserEmail = $('#newUserEmailInput').val();
        var newUserFirstName = $('#newUserFirstNameInput').val();
        var newUserLastName = $('#newUserLastNameInput').val();
        var newUserRole = $( "input[name=newUserInviteRadioOptions]:checked" ).val();

        if (!utils.validateEmail(newUserEmail)){
            //email is invalid
            var options = {};
            options.title = 'Invalid Email Address';
            options.message = "We're sorry, but "+ newUserEmail +" is not a valid email address." ;
            options.callback = function () {
                $('#newUserEmailInput').focus();
            };
            modalMessage.showMessage(options);
            return;
        }

        if (newUserFirstName.length === 0){
            options = {};
            options.title = 'Missing First Name';
            options.message = "Please enter the new Team Member's first name" ;
            options.callback = function () {
                $('#newUserFirstNameInput').focus();
            };
            modalMessage.showMessage(options);
            return;
        }

        if (newUserLastName.length === 0){
            options = {};
            options.title = 'Missing Last Name';
            options.message = "Please enter the new Team Member's last name" ;
            options.callback = function () {
                $('#newUserLastNameInput').focus();
            };
            modalMessage.showMessage(options);
            return;
        }

        //check if submitted email has already been used
        var filtereduserList = adminUsersPage.userList.filter(function (user) {
            return user.userDetails.email === newUserEmail ;
        });

        if (filtereduserList.length === 0){
            //email has not been used
            utils.activeButton('sendInvitationSubmitButton','Sending Invitation');

            adminUsersPage.inviteGUID = utils.guid();

            var userDetails = {
                customerID: globals.theCustomer.customerID,
                userGUID:   adminUsersPage.inviteGUID,
                email:      newUserEmail,
                firstName:  newUserFirstName,
                lastName:   newUserLastName,
                role:       newUserRole,
                status:     'Invited'
            };

            awsDynamoDBConnector.update_iqUsers(userDetails, adminUsersPage.invitationRecordCreated)

        }
        else {
            //email has been used
            options = {};
            options.title = 'Email Already Used';
            options.message = "We're sorry, but "+ newUserEmail +" has already been registered.<br>Please use a different Email Address" ;
            options.callback = function () {
                $('#newUserEmailInput').focus();
            };
            modalMessage.showMessage(options);
        }

    },

    //******************************************************************************************************************
    invitationRecordCreated: function (success, results) {

        if (success){
            //record created successfully

            adminUsersPage.sendInvitationEmail($('#newUserEmailInput').val());

            $('#newUserEmailInput').val('');
            $('#newUserFirstNameInput').val('');
            $('#newUserLastNameInput').val('');
            $( "input[name=newUserInviteRadioOptions]" ).val('Agent');


        }
        else {
            //failed to create record
            options = {};
            options.title = 'Communication Error';
            options.message = "We're sorry, but something went wrong while talking to The Cloud.<br>Please use a different Email Address" ;
            options.callback = function () {

            };
            modalMessage.showMessage(options);
        }

    },

    //******************************************************************************************************************
    sendInvitationEmail: function (to) {


        var htmlContent = "" +
            "<h1>" +
                "You've been invited to iQueue" +
            "</h1>" +
            "<br>" +
            "<br>" +
            "<p>" +
                'Your iQueue Invitation Code is:<span style="font-weight: bold"> ' + adminUsersPage.inviteGUID + '</span><br>' +
                "<br>" +
                "Please visit <a href='https://d1eoip8vttmfc7.cloudfront.net/index_secure.htm?secret1=" + globals.theCustomer.customerID + "&secret2=invu47'>iQueue</a>  and enter this Invitation Code in the iQueue registration screen." +
            "</p>"





        var plainContent = "This is the plain content";



        awsSESConnector.sendEmail(to,"You've Been Invited To iQueue", htmlContent, plainContent);


        options = {};
        options.title = to + ' has been invited to iQueue';
        options.message = "We've sent an Email to " + to + " with instructions on how to access iQueue." ;
        options.callback = function () {
            adminUsersPage.render();
        };
        modalMessage.showMessage(options);

    }

    //******************************************************************************************************************

};
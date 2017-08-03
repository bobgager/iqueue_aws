/**
 * Created by bgager on 5/14/17.
 */

//**********************************************************************************************************************
function initialize() {

    console.log('initialize called');

    utils.writeDebug('index.js initializing',true);

    $('#loading-iqueue-progress').hide();
    $('#authenticatedContent').hide();
    $('#mainNavbar').hide();
    $('#otherHeaderContent').hide();

    //see if this is a page being loaded in response to an invitation
    var secret1 = utils.GetURLParameter('secret1');
    if (secret1){
        var secret2 = utils.GetURLParameter('secret2');
        $.getScript('pages/' + secret2 + '.js?version='+ globals.version,function () {
            $('#login-form').slideUp(1000);
            invitationPage.configure(secret1);
        });
    }

}

//**********************************************************************************************************************
function signIn() {

    $('#login-message').html('');

    //remove any spaces from the Username input
    $('#login-username').val($('#login-username').val().replace(/\s+/g, ''));

    //and convert it to lowercase
    $('#login-username').val($('#login-username').val().toLowerCase());

    var username = $('#login-username').val();
    var password = $('#login-password').val();

    utils.activeButton('signInBTN','Signing In' );

    awsCognitoConnector.signInUser(username, password, signInReturned);
}
//----------------------------------------------------------------------------------------------------------------------
function signInReturned(success, data, userAttributes) {
    if (success){
        //console.log('user signed in successfully');

        userAttributes.forEach(function (attribute) {

            switch(attribute.Name) {
                case 'custom:iqueue_customerid':
                    globals.cognitoUserAttributes.customerID = attribute.Value;
                    break;
                case 'custom:iqueue_role':
                    globals.cognitoUserAttributes.role = attribute.Value;
                    break;
                case 'custom:iqueue_guidusername':
                    globals.cognitoUserAttributes.guidUserName = attribute.Value;
                    break;
                default:
                //no default code

            }

        });

        globals.cognitoUserAttributes.userName = awsCognitoConnector.cognitoUser.username;


        postAuthConfigure();

    }
    else{
        if (data === 'newPasswordRequired'){
            $('#forced-password-reset-modal-message').html('');
            $('#forced-password-reset-modal').modal('show');
        }
        else {
            $('#login-message').html('Sorry, that Username/Password combination is not recognized.');
        }
    }
}

//**********************************************************************************************************************
function forcedPasswordResetSubmit(password1, password2) {

    $('#forced-password-reset-modal-message').html('');

    //make sure the passwords are the same
    if (password1 != password2){
        $('#forced-password-reset-modal-message').html('The Passwords must match!');
        return;
    }

    //make sure the passwords are at least 8 characters
    if (password1.length < 8){
        $('#forced-password-reset-modal-message').html('The Passwords must be at least 8 characters long!');
        return;
    }

    //all good to reset
    awsCognitoConnector.forcedPasswordReset(password1, {}, forcedPasswordResetSubmitReturned);

}
//----------------------------------------------------------------------------------------------------------------------
function forcedPasswordResetSubmitReturned(success, data) {
    if (success){
        //the password was changed successfully
        $('#forced-password-reset-modal').modal('hide');
        $('#login-password').val('');
        $('#login-message').html('Your Password has been reset.<br>Please Sign In.');

        return;
    }

    $('#forced-password-reset-modal-message').html('There was some kind of error.<br>Please try again.<br>Error Code: fprsr001<br>'+ data);

}

//**********************************************************************************************************************
function forgotPassword() {

    $('#forgotPWLink').html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> Checking');
    setTimeout(function () {
        $('#forgotPWLink').html('Forgot Your Password?');
    }, 2000);

    //remove any spaces from the Username input
    $('#login-username').val($('#login-username').val().replace(/\s+/g, ''));

    //and convert it to lowercase
    $('#login-username').val($('#login-username').val().toLowerCase());

    var username = $('#login-username').val();

    //make sure they entered a Username
    if (username.length === 0 ){

        $('#login-message').html('Please enter a Username!');

        return;
    }

    //we've got a username
    awsCognitoConnector.cognitoUser.username = username;
    awsCognitoConnector.forgotPassword(username,forgotPasswordReturned);

}

//**********************************************************************************************************************
function forgotPasswordReturned(success, data) {

    if (!success){

        if (data.code === 'LimitExceededException'){
            $('#login-message').html('Sorry, you&#39;ve made too many requests in a short amount of time.<br><br>Please try again later');
        }
        else {
            $('#login-message').html('Sorry, that Username is n&#39;t recognized<br>Please try again');
        }
        return;
    }

    //the username didn't fail
    $('#login-message').html('');


    $('#password-reset-modal-message').html('We&#39;ve sent an Email to '+ data +'<br> with a Verification Code<br><br>Please enter it below along with a new Password')

    $('#password-reset-modal').modal('show');


}

//**********************************************************************************************************************
function passwordResetSubmit() {

    var verificationCode = $('#reset-password-verification-code').val();

    if (verificationCode.length === 0){
        $('#password-reset-modal-message').html('Please enter the Verification Code that we sent to your Email.');
        return;
    }

    var pw1 = $('#new-password').val();
    var pw2 = $('#new-password-2').val();

    if
    (pw1.length <8){
        $('#password-reset-modal-message').html('Your new Password must be at least 8 characters long.');
        return;
    }

    if (pw1 != pw2){
        $('#password-reset-modal-message').html('Those Passwords don&#39;t match');
        return;
    }

    var username = awsCognitoConnector.cognitoUser.username;

    awsCognitoConnector.resetPasswordVerificationCode(username,verificationCode,pw1,passwordResetSubmitReturned);

}

//**********************************************************************************************************************
function passwordResetSubmitReturned(success, data) {

    if (!success){
        $('#password-reset-modal-message').html('Something went wrong.<br>Please try again.<br><br>Error: prsr:001<br>'+data);
        return;
    }

    $('#password-reset-modal').modal('hide');

    $('#login-message').html('You&#39;re Password has been reset.<br>Please Sign In with your new Password.');


}

//**********************************************************************************************************************
function postAuthConfigure() {

    $('#loading-iqueue-progress').fadeIn();
    $('#login-form').slideUp(1000);

    $('#loading-iqueue-progress-bar').addClass('w-40');

    awsCognitoConnector.fetchAuthConfig(authConfigurationReturned);

}
//----------------------------------------------------------------------------------------------------------------------
function authConfigurationReturned (success, data){

    if (!success){
        $('#loading-iqueue-progress-bar').removeClass('w-40');
        $('#loading-iqueue-progress').fadeOut();
        $('#login-form').slideDown(1000);
        $('#login-message').html('Hmmmm...<br>Something went wrong...<br>Please Sign In again.');
        return;
    }

    $.getScript(data.authenticatedConfigurationScript +'?version=' + globals.version);

}

//**********************************************************************************************************************

//**********************************************************************************************************************
initialize();
//**********************************************************************************************************************
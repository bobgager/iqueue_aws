/**
 * Created by bgager on 5/25/17.
 */

var userDetailsPage = {

    //******************************************************************************************************************
    render: function () {

        jPM.close();


        $('#authenticatedContent').hide().load("pages/userDetails.html", function() {

            utils.writeDebug('userDetails Page loaded',false);

        }).fadeIn('1000');

    },

    //******************************************************************************************************************
    userInfoComplete: function () {

        //for now, there are no additional user parameters required that we don't collect at account creation
        //so, just return true
        //if later we add additional required parameters, then return false

        return (true);
    }

    //******************************************************************************************************************
    //******************************************************************************************************************
};
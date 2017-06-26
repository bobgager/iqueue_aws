
myApp.onPageInit('configure', function (page) {

    //watch for these events
    $$('#configurationForm').on('submit', configurePage.config_code_input_submit);



});

var configurePage = {

    //******************************************************************************************************************


    //******************************************************************************************************************

    //******************************************************************************************************************
    config_code_input_submit: function(e){
        if(e){
            e.preventDefault();
        }


        var configCode = $('#configCode').val();

        //make sure something was typed in
        if(configCode.length === 0){
            myApp.alert("Please see the administrator of the iQueue installation you are trying to connect to for your<br>Configuration Code.", 'Configuration Code<br>Required!');
            return;
        }

        //myApp.alert(configCode +' Submitted');

        //see if it's a valid configCode
        console.log('about to call awsConnector.fetchCustomerConfigByConfigCode ');
        awsConnector.fetchCustomerConfigByConfigCode(configCode,configurePage.customerReturned);

    },

    //******************************************************************************************************************
    customerReturned: function (){

        console.log('awsConnector.fetchCustomerConfigByConfigCode returned succesfully');

        if(globals.customer){
            //the configCode the user entered is good
            //console.log('good config code');

            // since it's a good code save it locally
            globals.setPersistentGlobal('configCode', $('#configCode').val()) ;

            //and update the launch URL to include the config code
            globals.launchURL = globals.launchURL +'?configCode=' + globals.customer.configCode;

            //purge any previous fetch of the locations array since we might have changed customers
            globals.theLocationsArray = [];

            //fetch the locations for this customer
            awsConnector.fetchCustomerLocationsTable(app.locationsReturned);

            return;
        }

        myApp.alert("Please see the administrator of the iQueue installation you are trying to connect to for your<br>Configuration Code.", 'Invalid<br>Configuration Code!');

    }

    //******************************************************************************************************************
    //******************************************************************************************************************

};
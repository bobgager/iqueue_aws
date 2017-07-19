/**
 * Created by bgager on 4/23/17.
 */

var utils = {

    //******************************************************************************************************************



    //******************************************************************************************************************
    activeButton: function (buttonID, activeText, timeout) {

        timeout = timeout || 2000;

        var oldText = $('#' + buttonID).html();

        $('#' + buttonID).html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>&nbsp;' + activeText);
        $('#' + buttonID).prop("disabled", true);

        setTimeout(function () {
            $('#' + buttonID).html(oldText);
            $('#' + buttonID).prop("disabled", false);
        }, timeout);

    },


    //******************************************************************************************************************
    calibratedDateTime: function(){

         //this function needs to return a claibrated Date/Time value so that different agents
        //will all be using the same clock even though they are on different machines that could be sent differently

        //if we don't have the server offset, get it.
        if(globals.serverTimeOffset === 0){

            var currentDateTime = new Date().getTime();
            utils.writeDebug('Local Time = ' + currentDateTime, false);

            $.get("pages/time.html?version=" + currentDateTime, function(data, status, request){
                var st = request.getResponseHeader("Date");
                var serverDate = new Date(st);
                utils.writeDebug('Server Time = ' + serverDate.getTime(), false);

                var now = new Date();

                globals.serverTimeOffset = now.getTime() - serverDate.getTime();

            });



/*            $.ajax({
                dataType : 'json',
                url: 'https://cobaltfire.com/iqueue3/backbone_php/servertime.php',
                type: 'get',
                success: function(results) {

                    //TODO stop using cobaltfire.com to get a common time
                    console.log('TODO stop using cobaltfire.com to get a common time  (utils.calibratedDateTime)');
                    utils.writeDebug('<span class="text-warning">TODO stop using cobaltfire.com to get a common time. (utils.calibratedDateTime)</span>', false);

                    var serverTime = results * 1000;

                    var now = new Date();
                    var localTime = now.getTime();

                    globals.serverTimeOffset = localTime - serverTime;

                },
                error: function (request, status, error) {

                    //TODO stop using cobaltfire.com to get a common time
                    console.log('TODO stop using cobaltfire.com to get a common time  (utils.calibratedDateTime)');
                    utils.writeDebug('<span class="text-warning">TODO stop using cobaltfire.com to get a common time.  (utils.calibratedDateTime)</span>', false);

                }
            });*/


        }

        var now = new Date();

        var calibratedTime = now.getTime() - globals.serverTimeOffset;

        var calibratedDateTime = new Date(calibratedTime);

        return calibratedDateTime;
    },

    //******************************************************************************************************************
    fatalError:function (code, data) {
        var options = {};
        options.title = 'DOH: The Cloud is a little stormy today.';
        options.message = "We're sorry, but there was a fatal error while trying to reach our server in The Cloud.<br><br>Error Code: " + code + "<br>Error: "+ data ;
        options.size = 'large';
        options.buttonName = 'Start Over';
        options.callback = function () {
            window.open("http://iqueue.cloud", '_self');
        };
        modalMessage.showMessage(options);
    },

    //******************************************************************************************************************
    // fetch a URL variable
    GetURLParameter: function(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++)
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam)
            {
                return sParameterName[1];
            }
        }
    },

    //******************************************************************************************************************
    guid: function () {
        function _p8(s) {
            var p = (Math.random().toString(16)+"000000000").substr(2,8);
            return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    },

    //******************************************************************************************************************
    validateEmail: function (email) {
        var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    },

    //******************************************************************************************************************
    writeDebug: function (string,clear) {

        var now = new Date();

        if (globals.showDebug){
            $('#debugDIV').show();
        }
        else {
            $('#debugDIV').hide();
        }

        if (clear){
            $('#debugDIV').html( now.getMinutes() + ':' + now.getSeconds() + ': version = ' + globals.version);
        }

        if (string.length > 0){
            $('#debugDIV').html($('#debugDIV').html() + '<br>' +  now.getMinutes() + ':' + now.getSeconds() + ': ' + string);
        }

    }

    //******************************************************************************************************************
    //******************************************************************************************************************



};
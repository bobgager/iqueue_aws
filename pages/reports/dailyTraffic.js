/**
 * Created by bgager on 5/25/17.
 */

var dailyTrafficPage = {

    pageURL: 'pages/reports/dailyTraffic.html',

    //******************************************************************************************************************
    preRender: function (callback) {
        //initialize anything that is required before the page gets rendered

        utils.writeDebug('dailyTrafficPage.preRender has been called', false);

        //go back to the router to actually load the page
        callback();
    },

    //******************************************************************************************************************
    postRender: function () {
        //script that runs after the page has been loaded
        utils.writeDebug('dailyTrafficPage.postRender has been called', false);
    }

    //******************************************************************************************************************
    //******************************************************************************************************************
};
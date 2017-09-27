/**
 * Created by bgager on 5/25/17.
 */

var studentSearchPage = {

    pageURL: 'pages/reports/studentSearch.html',

    //******************************************************************************************************************
    preRender: function (callback) {
        //initialize anything that is required before the page gets rendered

        utils.writeDebug('studentSearchPage.preLoad has been called', false);

        //go back to the router to actually load the page
        callback();
    },

    //******************************************************************************************************************
    postRender: function () {
        //script that runs after the page has been loaded
        utils.writeDebug('studentSearchPage.postLoad has been called', false);
    },

    //******************************************************************************************************************
    preClose: function (callback) {
        //this script runs before the next page is loaded.
        //useful to purge any event watchers or kill any timers

        utils.writeDebug('studentSearchPage.preClose has been called', false);

        callback();
    }

    //******************************************************************************************************************
    //******************************************************************************************************************
};
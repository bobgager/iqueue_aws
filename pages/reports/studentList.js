/**
 * Created by bgager on 5/25/17.
 */

var studentListPage = {

    pageURL: 'pages/reports/studentList.html',

    //******************************************************************************************************************
    preLoad: function (callback) {
        //initialize anything that is required before the page gets rendered

        utils.writeDebug('studentListPage.preLoad has been called', false);

        //go back to the router to actually load the page
        callback();
    },

    //******************************************************************************************************************
    postLoad: function () {
        //script that runs after the page has been loaded
        utils.writeDebug('studentListPage.postLoad has been called', false);
    },

    //******************************************************************************************************************
    preClose: function (callback) {
        //this script runs before the next page is loaded.
        //useful to purge any event watchers or kill any timers

        utils.writeDebug('studentListPage.preClose has been called', false);

        callback();
    }

    //******************************************************************************************************************
    //******************************************************************************************************************
};
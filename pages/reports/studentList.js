/**
 * Created by bgager on 5/25/17.
 */

var studentListPage = {

    pageURL: 'pages/reports/studentList.html',

    //******************************************************************************************************************
    preRender: function (callback) {
        //initialize anything that is required before the page gets rendered

        utils.writeDebug('studentListPage.preRender has been called', false);

        //go back to the router to actually load the page
        callback();
    },

    //******************************************************************************************************************
    postRender: function () {
        //script that runs after the page has been loaded
        utils.writeDebug('studentListPage.postRender has been called', false);
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
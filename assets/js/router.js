
var router = {

    currentPage: null,  //holds the string name of the page
    thePage: null,      //holds the object variable of the page

    //******************************************************************************************************************
    showPage: function (pageName) {

        //close the side menu in case it's open
        jPM.close();

        //save the pageName in case we need to know it later
        router.currentPage = pageName;

        if (router.thePage){
            router.thePage.preClose(router.preCloseDone);
        }
        else {
            router.preCloseDone();
        }

    },

    //******************************************************************************************************************
    preCloseDone: function () {

        switch(router.currentPage) {
            case 'dashboardPage':
                router.thePage = dashboardPage;
                break;
            case 'myQueuePage':
                router.thePage = myQueuePage;
                break;
            case 'myQueueDetailsPage':
                router.thePage = myQueueDetailsPage;
                break;
            case 'adminIqueuePage':
                router.thePage = adminIqueuePage;
                break;
            case 'adminUsersPage':
                router.thePage = adminUsersPage;
                break;
            case 'adminDisplayPage':
                router.thePage = adminDisplayPage;
                break;
            case 'agentMetricsPage':
                router.thePage = agentMetricsPage;
                break;
            case 'dailyTrafficPage':
                router.thePage = dailyTrafficPage;
                break;
            case 'studentListPage':
                router.thePage = studentListPage;
                break;
            case 'studentSearchPage':
                router.thePage = studentSearchPage;
                break;
            case 'touchpointsPage':
                router.thePage = touchpointsPage;
                break;
            default:
                //if all else fails, just load the dashboard
                router.thePage = dashboardPage;

                //and post an error message
                var options = {};
                options.title = 'Page Naming Error';
                options.message = router.currentPage + " is not a defined page in the router!";
                options.callback = function () {

                };
                modalMessage.showMessage(options);
        }

        //call the preLoad function on the page
        router.thePage.preLoad(router.preLoadDone);
    },

    //******************************************************************************************************************
    preLoadDone: function () {

        //load the page
        $('#authenticatedContent').hide().load(router.thePage.pageURL + "?version="+ globals.version, function() {

            utils.writeDebug(router.currentPage + ' loaded',false);

            router.thePage.postLoad();

        }).fadeIn(1000);

    }

    //******************************************************************************************************************
    //******************************************************************************************************************


};
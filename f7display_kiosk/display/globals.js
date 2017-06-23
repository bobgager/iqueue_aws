
var globals = {

    version: 2.040,
    version_Kiosk: 2.040,
    version_Display: 2.040,
    appVersion: 2.040,  //this is the backend version

    localDev: false,

    //holds various server based configuration values
    AppConfiguration: null,

    //set to true for the setup being run
    isDisplay: false,
    isKiosk: false,
    isBackend: false,

    //holds the current view being displayed
    currentView: null,

    //holds the time the endpoint was loaded
    endpointLoadTime: new Date(),

    //holds the URL that launched the display or Kiosk so we can relaunch automatically if needed
    launchURL: null,

    //holds the milliseconds between the local clock time and the server clock time.
    serverTimeOffset: 0,

    //holds the configuration code to identify which iQueue customer is being accessed
    configCode: '',

    //holds the iQueue customer info
    customer: null,

    //holds info about the customers locations
    theLocationsArray:  [],
    //holds the locationID as passed in from a URL parameter
    theLocationIDfromURL: null,
    //and the location selected by this user
    theLocation: null,
    theLocationID:  null,
    theLocationName: '',
    theLocationSubName: '',

    //holds the latest fetch of the Categories of questions
    theCategoriesArray:  [],
    theFAQs:[],
    //and the Category selected by this user
    theCategoryID: null,
    theCategoryName: '',

    //holds the latest fetch of the SubCategories of questions
    theSubCategoriesArray:  [],
    //and the SubCategory selected by this user
    theSubCategoryID: null,
    theSubCategoryQuestion: '',

    //holds the latest fetch of the Methods Of Service
    methodsOfServiceArray: [],

    //holds some additional detail for this user
    userFirstName:  '',
    userLastName:   '',
    userEmail:      '',
    userCellPhoneNumber: '',
    referredBy:     '',

    //a timer to auto restart if a user walks away
    restartTimer: 1,

    //holds the guid of this user if they are in line
    myguid: null,

    //holds the ID of the users open question in the database
    myQuestionID:   null,

    //******************************************************************************************************************
    initPersistentGlobals: function(){
        //pull all the persistent globals out of persistent storage

        globals.configCode = $.jStorage.get('configCode');

        globals.userFirstName = $.jStorage.get('userFirstName');
        globals.userLastName = $.jStorage.get('userLastName');
        globals.userEmail = $.jStorage.get('userEmail');
        globals.userCellPhoneNumber = $.jStorage.get('userCellPhoneNumber');

        globals.theLocationID = $.jStorage.get('theLocationID');
        globals.theLocationName = $.jStorage.get('theLocationName');
        globals.theLocationSubName = $.jStorage.get('theLocationSubName');

        globals.myguid = $.jStorage.get('myguid');
        if(!globals.myguid){globals.setPersistentGlobal('myguid', '')};

        globals.myQuestionID = $.jStorage.get('myQuestionID');
        globals.launchURL = $.jStorage.get('launchURL');
    },

    //******************************************************************************************************************
    setPersistentGlobal: function(globalName, globalValue){

        switch(globalName) {

            case 'configCode':
                $.jStorage.set('configCode', globalValue);
                globals.configCode = globalValue;
                break;

            case 'userFirstName':
                $.jStorage.set('userFirstName', globalValue);
                globals.userFirstName = globalValue;
                break;

            case 'userLastName':
                $.jStorage.set('userLastName', globalValue);
                globals.userLastName = globalValue;
                break;

            case 'userEmail':
                $.jStorage.set('userEmail', globalValue);
                globals.userEmail = globalValue;
                break;

            case 'userCellPhoneNumber':
                $.jStorage.set('userCellPhoneNumber', globalValue);
                globals.userCellPhoneNumber = globalValue;
                break;

            case 'theLocationID':
                $.jStorage.set('theLocationID', globalValue);
                globals.theLocationID = globalValue;
                break;

            case 'theLocationName':
                $.jStorage.set('theLocationName', globalValue);
                globals.theLocationName = globalValue;
                break;

            case 'theLocationSubName':
                $.jStorage.set('theLocationSubName', globalValue);
                globals.theLocationSubName = globalValue;
                break;

            case 'myguid':
                $.jStorage.set('myguid', globalValue);
                globals.myguid = globalValue;
                break;

            case 'myQuestionID':
                $.jStorage.set('myQuestionID', globalValue);
                globals.myQuestionID = globalValue;
                break;

            case 'launchURL':
                $.jStorage.set('launchURL', globalValue);
                globals.launchURL = globalValue;
                break;

            default:
            //
        }


    }

};

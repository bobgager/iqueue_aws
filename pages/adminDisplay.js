/**
 * Created by bgager on 5/25/17.
 */

var adminDisplayPage = {

    galleryThumbs: null,


    librarySwiper: null,


    theDisplaySlidesArray: [],

    theBackgroundImageLibraryArray: [],

    currentSlideIndex: 0,
    lastSlideID: null,

    newSlideText: '',

    //******************************************************************************************************************
    render: function () {

        jPM.close();

        globals.currentPage = 'adminDisplayPage';


        $('#authenticatedContent').hide().load("pages/adminDisplay.html?version="+ globals.version, function() {

            $('#pageLocationLabel').html(globals.theLocation.name);

            utils.writeDebug('adminDisplay Page loaded',false);

            $('#verticalSpacer').hide('slow');

            //setup the proper button configuration
            adminDisplayPage.setupButtons('init');

            //setup the background image library swiper
            adminDisplayPage.librarySwiper = new Swiper('.swiper-container-library', {
                effect: 'coverflow',
                grabCursor: false,
                nextButton: '.swiper-button-next-library',
                prevButton: '.swiper-button-prev-library',
                centeredSlides: true,
                slidesPerView: 'auto',
                coverflow: {
                    rotate: 40,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows : true
                }
            });

            //hide the background picker
            //$('#slideBackgroundPicker').hide();

            //remove any swiper handlers that may have been previously set
            if(adminDisplayPage.galleryThumbs){
                adminDisplayPage.galleryThumbs.off('slideChangeEnd');
            }

            adminDisplayPage.galleryThumbs = new Swiper('.gallery-thumbs', {
                spaceBetween: 10,
                centeredSlides: true,
                slidesPerView: 'auto',
                touchRatio: 0.2,
                slideToClickedSlide: true,
                nextButton: ".swiper-button-next",
                prevButton: ".swiper-button-prev"
            });

            adminDisplayPage.galleryThumbs.on('slideChangeEnd', adminDisplayPage.slideChanged);


            //read the list of Display Messages from AWS
            awsDynamoDBConnector.fetchDisplayMessages(globals.theLocation.locationID,adminDisplayPage.displaySlidesReturned);

            //read the list of images in the S3 Display Bucket for this location
            var bucketName = 'iqueuedisplay'+ globals.theLocation.locationID.toLowerCase();

            AWSS3.s3ReadBucketContents(bucketName, adminDisplayPage.displayImagesReturned);


        }).fadeIn('1000');



    },

    //******************************************************************************************************************
    locationChanged: function () {

        adminDisplayPage.render();

    },

    //******************************************************************************************************************
    setupButtons: function(state){

        switch(state) {
            case 'normal':
                $('#editTextBtn').show('slow');
                $('#deleteSlideBtn').show('slow');
                $('#textEditBtns').hide('slow');
                $('#changeBkgndBtn').show('slow');
                $('#deleteSlideConfirmBtn').hide('slow');
                $('#moreBtn').show('slow');
                $('#newSlideBtn').show('slow');
                $('#backgroundPickerButtons').hide('slow');
                $('#previousSlideBtn').show('slow');
                $('#nextSlideBtn').show('slow');
                break;
            case 'editingText':
                $('#editTextBtn').hide('slow');
                $('#deleteSlideBtn').hide('slow');
                $('#textEditBtns').show('slow');
                $('#changeBkgndBtn').hide('slow');
                $('#deleteSlideConfirmBtn').hide('slow');
                $('#moreBtn').hide('slow');
                $('#newSlideBtn').hide('slow');
                $('#backgroundPickerButtons').hide('slow');
                $('#previousSlideBtn').show('slow');
                $('#nextSlideBtn').show('slow');
                break;
            case 'changingBackground':
                $('#editTextBtn').hide('slow');
                $('#deleteSlideBtn').hide('slow');
                $('#textEditBtns').hide('slow');
                $('#changeBkgndBtn').hide('slow');
                $('#deleteSlideConfirmBtn').hide('slow');
                $('#moreBtn').hide('slow');
                $('#newSlideBtn').hide('slow');
                $('#backgroundPickerButtons').show('slow');
                $('#previousSlideBtn').hide('slow');
                $('#nextSlideBtn').hide('slow');
                break;
            case 'confirmDelete':
                $('#editTextBtn').hide('slow');
                $('#deleteSlideBtn').hide('slow');
                $('#textEditBtns').hide('slow');
                $('#changeBkgndBtn').hide('slow');
                $('#deleteSlideConfirmBtn').show('slow');
                $('#moreBtn').hide('slow');
                $('#newSlideBtn').hide('slow');
                $('#backgroundPickerButtons').hide('slow');
                $('#previousSlideBtn').hide('slow');
                $('#nextSlideBtn').hide('slow');
                break;
            case 'noSlides':
                $('#editTextBtn').hide('slow');
                $('#deleteSlideBtn').hide('slow');
                $('#textEditBtns').hide('slow');
                $('#changeBkgndBtn').hide('slow');
                $('#deleteSlideConfirmBtn').hide('slow');
                $('#moreBtn').hide('slow');
                $('#newSlideBtn').show('slow');
                $('#backgroundPickerButtons').hide('slow');
                $('#previousSlideBtn').hide('slow');
                $('#nextSlideBtn').hide('slow');
                break;
            default:
                $('#editTextBtn').show();
                $('#deleteSlideBtn').show();
                $('#textEditBtns').hide();
                $('#changeBkgndBtn').show();
                $('#deleteSlideConfirmBtn').hide();
                $('#moreBtn').show();
                $('#newSlideBtn').show();
                $('#backgroundPickerButtons').hide('slow');
                $('#previousSlideBtn').show('slow');
                $('#nextSlideBtn').show('slow');
        }

    },

    //******************************************************************************************************************
    slideChanged: function(swiper){

        $('#verticalSpacer').hide('slow');

        var activeSlide = adminDisplayPage.currentSlideIndex;

        if(swiper){
            activeSlide = swiper.activeIndex;
            adminDisplayPage.currentSlideIndex = activeSlide;
        }
        else {
            adminDisplayPage.galleryThumbs.slideTo(activeSlide);
        }


        //get rid of the text editor if it's open
        $('#slidePreviewText').summernote('destroy');

        //reset the buttons
        adminDisplayPage.setupButtons('normal');

        //make sure the image picker isn't showing

        $('#awsImageManager').removeClass('swingShow');
        $('#slidePreviewContainer').addClass('swingShow');

        adminDisplayPage.lastSlideID = adminDisplayPage.theDisplaySlidesArray[activeSlide].messageID;
        adminDisplayPage.newSlideText = adminDisplayPage.theDisplaySlidesArray[activeSlide].message;
        $('#slidePreviewText').html(adminDisplayPage.theDisplaySlidesArray[activeSlide].message);

        $('#slidePreviewImage').css('background-image','url(' + adminDisplayPage.theDisplaySlidesArray[activeSlide].backgroundImageURL + ')');


        //set the proper slide duration menu check item
        $('#slideDuration30Menu').hide();
        $('#slideDuration60Menu').hide();
        $('#slideDuration90Menu').hide();

        $('#slideDuration'+ adminDisplayPage.theDisplaySlidesArray[activeSlide].displayTime +'Menu').show();


    },

    //******************************************************************************************************************
    displaySlidesReturned: function(success, theDisplaySlides){
        //if success =  false, it means there was an error communicating with the cloud. The Error information wil be in theDisplaySlides

        if(!success){

            utils.fatalError('dsr001', 'Slide Read Failed<br>' + theDisplaySlides);

            return;
        }


        if(theDisplaySlides.length === 0){
            adminDisplayPage.setupButtons('noSlides');
            $('#slidePreviewText').html("No Display Slides");
            return;
        }

        //build the slides
        for (i = 0; i < theDisplaySlides.length; i++) {

            adminDisplayPage.galleryThumbs.appendSlide(adminDisplayPage.buildDisplaySlide(theDisplaySlides[i],245));


        }

        //save the slides for later editing
        adminDisplayPage.theDisplaySlidesArray = theDisplaySlides;

        for (i = 0; i < theDisplaySlides.length; i++) {
            if(theDisplaySlides[i].messageID === adminDisplayPage.lastSlideID){
                adminDisplayPage.currentSlideIndex = i;
            }
        }

        adminDisplayPage.slideChanged();

        $('#loadingSlidesLabel').fadeOut();
    },

    //******************************************************************************************************************
    displayImagesReturned: function(theDisplayImages){

        adminDisplayPage.librarySwiper.removeAllSlides();

        //show all the buttons
        $('#displaySelectImageBTN').show();
        $('#displayUploadImageBTN').show();
        $('#displayDeleteImageBTN').show();

        if(!theDisplayImages){
            //there was error reading the bucket list
            adminDisplayPage.librarySwiper.appendSlide('<div class="swiper-slide" ><div class="swiper-slide-message swiper-slide-failure-message "><br>There was an error loading the slide library.<br>Please reload your browser and try again.<br><br></div></div>');
            //hide all the buttons
            $('#displaySelectImageBTN').hide();
            $('#displayUploadImageBTN').hide();
            $('#displayDeleteImageBTN').hide();
            return;
        }

        if(theDisplayImages.length === 0){
            adminDisplayPage.librarySwiper.appendSlide('<div class="swiper-slide" ><div class="swiper-slide-message swiper-slide-empty-message "><br>There are no images in your image library.<br>Please click Upload New to add an image.<br><br></div></div>');
            //hide some buttons
            $('#displaySelectImageBTN').hide();
            $('#displayDeleteImageBTN').hide();
            return;
        }

        //sort the image array order so the more recently uploaded ones are first
        theDisplayImages.sort(function(a, b){return b.LastModified-a.LastModified});

        //save the image array for use in other functions
        adminDisplayPage.theBackgroundImageLibraryArray = theDisplayImages;

        for (i = 0; i < theDisplayImages.length; i++) {
            var theURL = 'https://iqueuedisplay' + globals.theLocation.locationID.toLowerCase() + '.s3.amazonaws.com/';
            theURL += theDisplayImages[i].Key;
            adminDisplayPage.librarySwiper.appendSlide('<div class="swiper-slide" style="background-image:url('+ theURL +')"></div>');
            adminDisplayPage.theBackgroundImageLibraryArray[i].url = theURL;
        }


    },

    //******************************************************************************************************************
    buildDisplaySlide: function(theDisplaySlide, slideWidth){

        //screen sizes          display slide size
        // 0.125    160x90         122x79
        // 0.25x    320x180        245x158
        // 0.5x     640x360        490x316
        // 1x       1280x720       980x632
        // 1.5x     1920x1080      1470x948
        // 2x       2560x1440      1960x1264


        //modify the font sizes to fit the specified width

        var scaleFactor = slideWidth/490;


        var replaced = theDisplaySlide.message;

        for (var i = 10; i < 100; i++) {
            var regexp = new RegExp("font-size: " + i + "px","g");
            replaced = replaced.replace(regexp, 'font-size: '+ i*scaleFactor + 'Spx');
        }


        replaced = replaced.replace(/Spx/g, 'px');


        //strip any line-height tags that might be in the message HTML
        for (i = 1; i < 50; i++) {
            regexp = new RegExp("line-height: " + i,"g");
            replaced = replaced.replace(regexp, 'line-heightS: ' );
        }

        var messageID = slideWidth + 'SlideMessage';

        //build the slide HTML
        var slideHTML = '<div class="swiper-slide" style="background-image:url(' + theDisplaySlide.backgroundImageURL + ')">' +
            '<div id="' + messageID + '" class="swiper-slide-message"   >' +
            replaced +
            '</div>' +
            '</div>';

        //console.log(slideHTML);

        return(slideHTML);


    },

    //******************************************************************************************************************
    editSlideText: function () {

        $('#verticalSpacer').show('slow');

        adminDisplayPage.setupButtons('editingText');

        $('#slidePreviewText').summernote({
            focus: true,
            fontSizes: ['12', '14', '18', '24', '36', '48' , '64', '82'],
            width: 490,
            callbacks: {
                onInit: function() {
                    //console.log('Summernote is launched');
                    $('.note-editable').css("background-color", "grey")
                    //$('.note-editor').css("top", "0px")
                }
            },
            toolbar: [
                // [groupName, [list of button]]
                ['style', ['bold', 'italic', 'underline']],
                ['fontname', ['fontname']],
                ['fontsize', ['fontsize']],
                ['color', ['color']],
                //['height', ['height']],
                ['para', ['ul', 'ol', 'paragraph']]
            ]
        });

    },

    //******************************************************************************************************************
    cancelTextEdits: function () {
        $('#verticalSpacer').hide('slow');
        $('#slidePreviewText').summernote('destroy');
        adminDisplayPage.setupButtons('normal');

    },

    //******************************************************************************************************************
    saveTextEdits : function () {


        $('#verticalSpacer').hide('slow');

        var markup = $('#slidePreviewText').summernote('code');

        //strip any line-height tags that might have been added by the editor
        for (i = 1; i < 50; i++) {
            regexp = new RegExp("line-height: " + i,"g");
            markup = markup.replace(regexp, 'line-heightS: ' );
        }

        $('#slidePreviewText').summernote('destroy');
        adminDisplayPage.setupButtons('normal');

        var theDisplaySlide = {};
        theDisplaySlide.locationID = adminDisplayPage.theDisplaySlidesArray[adminDisplayPage.currentSlideIndex].locationID;
        theDisplaySlide.messageID = adminDisplayPage.theDisplaySlidesArray[adminDisplayPage.currentSlideIndex].messageID;
        theDisplaySlide.message = markup;
        theDisplaySlide.backgroundImageURL = adminDisplayPage.theDisplaySlidesArray[adminDisplayPage.currentSlideIndex].backgroundImageURL;
        theDisplaySlide.displayTime = adminDisplayPage.theDisplaySlidesArray[adminDisplayPage.currentSlideIndex].displayTime;
        awsDynamoDBConnector.saveDisplaySlide(theDisplaySlide, adminDisplayPage.slideSaveReturned);

    },

    //******************************************************************************************************************
    slideSaveReturned:function (success) {

        adminDisplayPage.render();

    },

    //******************************************************************************************************************
    showImagePicker: function () {

        adminDisplayPage.setupButtons('changingBackground');

        //hide the slide swiper
        $('#liveSlidesDiv').fadeOut();

        //show the background picker
        $('#slideBackgroundPicker').fadeTo(1000, 1); //in case it still has the default opacity of 0
        $('#slideBackgroundPicker').fadeIn();

    },

    //******************************************************************************************************************
    hideImagePicker: function () {

        adminDisplayPage.setupButtons('normal');

        //hide the background picker
        $('#slideBackgroundPicker').fadeOut();

        //show the slide swiper
        $('#liveSlidesDiv').fadeIn();

    },

    //******************************************************************************************************************
    newBackgroundSlideSelected: function(){

        adminDisplayPage.hideImagePicker();

        var slideIndex = adminDisplayPage.librarySwiper.activeIndex;
        var activeSlide = adminDisplayPage.currentSlideIndex ;

        adminDisplayPage.theDisplaySlidesArray[activeSlide].backgroundImageURL= adminDisplayPage.theBackgroundImageLibraryArray[slideIndex].url;

        awsDynamoDBConnector.saveDisplaySlide(adminDisplayPage.theDisplaySlidesArray[activeSlide], adminDisplayPage.slideSaveReturned);

    },

    //******************************************************************************************************************
    uploadNewBackgroundStart: function () {
       $('#upload-new-background-modal').modal();
        $('#largeFileErrorMessage').hide();
        $('#nonJPEGErrorMessage').hide();
        $('#backgroundUploadProgressbar').hide();
        $('#backgroundUploadButtons').show();
    },

    //******************************************************************************************************************
    uploadNew: function(){

        $('#largeFileErrorMessage').hide();
        $('#nonJPEGErrorMessage').hide();
        $('#backgroundUploadProgressbar').hide();

        var fileChooser = document.getElementById('file-chooser');

        var file = fileChooser.files[0];

        if(file){

            var bucketName = 'iqueuedisplay'+ globals.theLocation.locationID.toLowerCase();

            //var fileName = file.name;
            var fileType = file.type;
            var fileSize = file.size;

            if(fileType !== 'image/jpeg'){
                //it's not a jpeg file
                $('#nonJPEGErrorMessage').show();
                return;
            }

            if(fileSize > 1000000){
                //the file is too large
                $('#largeFileErrorMessage').show();
                return;
            }

            var fileName = utils.guid()+ '.jpg';

            AWSS3.s3UploadFile(bucketName, fileName, file, adminDisplayPage.uploadComplete);

            $('#backgroundUploadProgressbar').show();
            $('#backgroundUploadButtons').hide();

        }

    },

    //******************************************************************************************************************
    uploadComplete: function(results){
        console.log('Upload Complete with Results = ' + results);

        //reload the images

        //read the list of images in the S3 Display Bucket for this location
        var bucketName = 'iqueuedisplay'+ globals.theLocation.locationID.toLowerCase();

        AWSS3.s3ReadBucketContents(bucketName, adminDisplayPage.displayImagesReturned);

        //hide the upload dialog
        $('#upload-new-background-modal').modal('hide');

    },

    //******************************************************************************************************************
    backgroundSlideDelete: function(){
        var slideIndex = adminDisplayPage.librarySwiper.activeIndex;
        var theURL = adminDisplayPage.theBackgroundImageLibraryArray[slideIndex].url;

        //figure out if the image is being used in a slide
        var imageUsed = false;
        adminDisplayPage.theDisplaySlidesArray.forEach(function(slide){
            if(slide.backgroundImageURL === theURL){
                //slide is being used
                imageUsed = true;
            }
        });

        if(imageUsed){
            var options = {};
            options.title = 'Sorry!';
            options.message = "That image cannot be deleted as it is being used in one or more of your slides.<br>Please remove it from all your slides and try again.";

            modalMessage.showMessage(options);
            return;
        }

        $('#imageToDelete').css('background-image','url('+ theURL +')');

        //show the confirm dialog
        $('#confirm-delete-modal').modal();

    },

    //******************************************************************************************************************
    deleteBackgroundConfirmed: function(){

        //hide the confirm dialog
        $('#confirm-delete-modal').modal('hide');

        var slideIndex = adminDisplayPage.librarySwiper.activeIndex;
        var theKey = adminDisplayPage.theBackgroundImageLibraryArray[slideIndex].Key;
        var bucketName = 'iqueuedisplay'+ globals.theLocation.locationID.toLowerCase();

        AWSS3.s3DeleteObject(bucketName, theKey, adminDisplayPage.deleteBackgroundComplete);

    },

    //******************************************************************************************************************
    deleteBackgroundComplete: function(){

        //reload the images
        //read the list of images in the S3 Display Bucket for this location
        var bucketName = 'iqueuedisplay'+ globals.theLocation.locationID.toLowerCase();

        AWSS3.s3ReadBucketContents(bucketName, adminDisplayPage.displayImagesReturned);
    },

    //******************************************************************************************************************
    setSlideDuration: function(time){

        var activeSlide = adminDisplayPage.currentSlideIndex ;
        adminDisplayPage.theDisplaySlidesArray[activeSlide].displayTime = time;

        awsDynamoDBConnector.saveDisplaySlide(adminDisplayPage.theDisplaySlidesArray[activeSlide], adminDisplayPage.slideSaveReturned);

    },

    //******************************************************************************************************************
    deleteSlide: function(){

        adminDisplayPage.setupButtons('confirmDelete');

    },

    //******************************************************************************************************************
    addNewSlide: function(){
        var theDisplaySlide = {};
        theDisplaySlide.locationID = globals.theLocation.locationID;
        theDisplaySlide.messageID = utils.guid();
        theDisplaySlide.message = '<div style="text-align: right; color: #ffffff"><span style="font-size: 18px;">This is your New Slide</span></div><div style="text-align: right; color: #ffffff"><span style="font-size: 14px;">Click Edit Text to start customizing it</span></div>';
        theDisplaySlide.backgroundImageURL = 'https://d1eoip8vttmfc7.cloudfront.net/assets/img/queue_image_display.jpg';
        theDisplaySlide.displayTime = '60';
        adminDisplayPage.lastSlideID = theDisplaySlide.messageID;
        awsDynamoDBConnector.saveDisplaySlide(theDisplaySlide, adminDisplayPage.slideSaveReturned);
    }

    //******************************************************************************************************************
    //******************************************************************************************************************
};
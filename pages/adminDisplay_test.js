/**
 * Created by bgager on 5/25/17.
 */

var adminDisplayTestPage = {

    theDisplaySlidesArray: [],

    currentIndex: 0,



    //******************************************************************************************************************
    render: function () {

        jPM.close();

        globals.currentPage = 'adminDisplayTestPage';


        $('#authenticatedContent').hide().load("pages/adminDisplay_test.html?version="+ globals.version, function() {

            utils.writeDebug('adminDisplayTest Page loaded',false);


            //read the list of Display Messages from AWS
            awsDynamoDBConnector.fetchDisplayMessages(globals.theLocation.locationID,adminDisplayTestPage.displaySlidesReturned);

            $('#textEditBtns').hide();



        }).fadeIn('1000');

    },

    //******************************************************************************************************************
    locationChanged: function () {

        adminDisplayTestPage.render();

    },

    //******************************************************************************************************************
    displaySlidesReturned: function(success, theDisplaySlides){
        //if success =  false, it means there was an error communicating with the cloud. The Error information wil be in theDisplaySlides

        if(!success){

            utils.fatalError('dsr001', 'Slide Read Failed<br>' + theDisplaySlides);

            return;
        }

        //save the slides for later access
        adminDisplayTestPage.theDisplaySlidesArray = theDisplaySlides;


        $('#loadingSlidesLabel').fadeOut();

        //show the first slide
        adminDisplayTestPage.currentIndex = 0;
        adminDisplayTestPage.showSlide();

    },

    //******************************************************************************************************************
    showSlide: function () {

        $('#122Slide').html(adminDisplayTestPage.buildDisplaySlide(adminDisplayTestPage.theDisplaySlidesArray[adminDisplayTestPage.currentIndex],122));
        $('#245Slide').html(adminDisplayTestPage.buildDisplaySlide(adminDisplayTestPage.theDisplaySlidesArray[adminDisplayTestPage.currentIndex],245));
        $('#490Slide').html(adminDisplayTestPage.buildDisplaySlide(adminDisplayTestPage.theDisplaySlidesArray[adminDisplayTestPage.currentIndex],490));
        $('#980Slide').html(adminDisplayTestPage.buildDisplaySlide(adminDisplayTestPage.theDisplaySlidesArray[adminDisplayTestPage.currentIndex],980));
        $('#1470Slide').html(adminDisplayTestPage.buildDisplaySlide(adminDisplayTestPage.theDisplaySlidesArray[adminDisplayTestPage.currentIndex],1470));

    },

    //******************************************************************************************************************
    nextSlide: function () {
        adminDisplayTestPage.currentIndex ++ ;
        if(adminDisplayTestPage.currentIndex > adminDisplayTestPage.theDisplaySlidesArray.length-1){adminDisplayTestPage.currentIndex=0};
        adminDisplayTestPage.showSlide();
    },

    //******************************************************************************************************************
    editSlideText: function () {

        $('#textEditBtns').show();
        $('#editTextBtn').hide();

        $('#490SlideMessage').summernote({
            focus: true,
            fontSizes: ['12', '14', '18', '24', '36', '48' , '64', '82'],
            width: 490,
            callbacks: {
                onInit: function() {
                    //console.log('Summernote is launched');
                    $('.note-editable').css("background-color", "grey")
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

        //App.displaymanager3view.setupButtons('editingText');

        //$('#verticalSpacer').show();
    },

    //******************************************************************************************************************
    cancelTextEdits: function () {
        $('#490SlideMessage').summernote('destroy');
        $('#textEditBtns').hide();
        $('#editTextBtn').show();
        $('#490Slide').html(adminDisplayTestPage.buildDisplaySlide(adminDisplayTestPage.theDisplaySlidesArray[adminDisplayTestPage.currentIndex],490));

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


    }

    //******************************************************************************************************************
    //******************************************************************************************************************
};
/**
 * Created by bgager on 7/28/16.
 */

var iQueueUtils = {

    //******************************************************************************************************************
    buildDisplaySlide: function(theDisplaySlide, slideWidth){

        //screen sizes          display slide size
        // 0.25x    320x180        245x158
        // 0.5x     640x360        490x316
        // 1x       1280x720       980x632
        // 1.5x     1920x1080      1470x948
        // 2x       2560x1440      1960x1264


        //modify the font sizes to fit the specified width

        var scaleFactor = slideWidth/490;

/*        var replaced = theDisplaySlide.message.replace(/font-size: 8px/g, 'font-size: '+ 8*scaleFactor + 'Spx');
        replaced = replaced.replace(/font-size: 9px/g, 'font-size: '+ 9*scaleFactor + 'Spx');
        replaced = replaced.replace(/font-size: 10px/g, 'font-size: '+ 10*scaleFactor + 'Spx');
        replaced = replaced.replace(/font-size: 11px/g, 'font-size: '+ 11*scaleFactor + 'Spx');
        replaced = replaced.replace(/font-size: 12px/g, 'font-size: '+ 12*scaleFactor + 'Spx');
        replaced = replaced.replace(/font-size: 14px/g, 'font-size: '+ 14*scaleFactor + 'Spx');
        replaced = replaced.replace(/font-size: 18px/g, 'font-size: '+ 18*scaleFactor + 'Spx');
        replaced = replaced.replace(/font-size: 24px/g, 'font-size: '+ 24*scaleFactor + 'Spx');
        replaced = replaced.replace(/font-size: 36px/g, 'font-size: '+ 36*scaleFactor + 'Spx');*/


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


        var slideHTML = '';

        slideHTML +=    '<div class="swiper-slide" style="background-image:url(' + theDisplaySlide.backgroundImageURL + ')">' +
                            '<div class="swiper-slide-message"   >' +
                                replaced +
                            '</div>' +
                        '</div>';

        //console.log(slideHTML);

        return(slideHTML);


    }

}
/**
 * Created by bgager on 6/2/17.
 */


var awsSESConnector = {

    ses: null,

    sendEmail: function (toAddress, subject, htmlContent, plainContent, callback) {

        //AWS.config.region = 'us-east-1';
        //awsSESConnector.ses = new AWS.SES({apiVersion: '2010-12-01'});

        /* The following example sends a formatted email: */

        var params = {
            Destination: {
                ToAddresses: [
                    toAddress
                ]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: htmlContent
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: plainContent
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: subject
                }
            },
            Source: "iqueue@cobaltfire.com"
        };
        awsSESConnector.ses.sendEmail(params, function(err, data) {
            if (err) {
                //console.log(err, err.stack); // an error occurred
                callback(false, err);
            }
            else  {
                //console.log('mail sent');           // successful response
                callback(true, data);
            }

        });




    }




}
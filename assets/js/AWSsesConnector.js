/**
 * Created by bgager on 6/2/17.
 */


var awsSESConnector = {

    sendEmail: function (toAddress, subject, htmlContent, plainContent) {

        //AWS.config.region = 'us-east-1';
        var ses = new AWS.SES({apiVersion: '2010-12-01'});

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
        ses.sendEmail(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log('mail sent');           // successful response
            /*
             data = {
             MessageId: "EXAMPLE78603177f-7a5433e7-8edb-42ae-af10-f0181f34d6ee-000000"
             }
             */
        });




    }




}
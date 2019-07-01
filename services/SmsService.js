var request = require("request");
var urlencode = require('urlencode');
var env       = process.env.NODE_ENV || 'development';
var config    = require('../config/config.json')[env];
var Q = require("q");
module.exports = {
    ReplaceContent: function(){
        var deferred = Q.defer(dataSms);
        var content = config.contentSMSNotification;
        content = content.replace('{{pond_description}}',dataSms.pond_description);
        content = content.replace('{{datatype_name}}',dataSms.datatype_name);
        content = content.replace('{{data_value}}',dataSms.data_value);
        content = content.replace('{{notif_title}}',dataSms.notif_title);
        content = content.replace('{{advice_message}}',dataSms.advice_message);
        deferred.resolve(content);
        return deferred.promise;
    },
    
    SendSms: function(phoneNumber, Content){
        var APIKey= config.SMSAPIKey;
        var SecretKey= config.SMSSecretKey;
        var SmsType = config.SmsType;
        var SmsIsUnicode = config.SMSIsUnicode;
        var sendContent = urlencode(Content);
        var url = config.SMSUrl;
        url += "SendMultipleMessage_V4_get?";
        url += "Phone="+ phoneNumber;
        url += "&ApiKey="+ APIKey;
        url += "&SecretKey="+ SecretKey;
        url += "&Content="+ sendContent;
        url += "&SmsType="+ SmsType;
        url += "&IsUnicode=" + SmsIsUnicode;
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                console.log(body);
                return body;
            }
        });
    }
}

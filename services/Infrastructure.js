var HttpStatus = require('http-status-codes');
var model = require('../models')
    env       = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];
module.exports ={
    //Tra ve chuoi json, hoac thong bao loi dua theo HttpStatusCode
    CreateResponse : function(statusCode, res, data){     
        res.set({ 'Content-Type': 'application/json; charset=utf-8' });
        switch (statusCode) {
            case HttpStatus.OK:
                res.status(200);
                res.json({"Error" : false, "Message": "Success", "data" : data, "length": (data)? data.length : 0});          
                break;
            case HttpStatus.CREATED:
                res.status(201);
                res.json({"Error" : false, "Message": "Success", "data" : data});          
                break;
            case HttpStatus.BAD_REQUEST:
                res.status(400);
                if(data.errors){
                    var errorValues = data.errors;
                    res.json({"Error":true, errorValues});
                }else{
                    res.json({"Error":true, "errorValues": data});
                }                
                break;
            case HttpStatus.UNAUTHORIZED:
                res.status(HttpStatus.UNAUTHORIZED);
                res.json({"Error":true, "Message": "Authorization has been denied for this request."});
                break;
            case HttpStatus.NOT_FOUND:
                res.status(404);
                res.json({"Error": true,"StatusCode": 404, "Message": (data) ? data : "Not Found"});
                break;
            case HttpStatus.FORBIDDEN:
                res.status(HttpStatus.FORBIDDEN);
                res.json({"Error": true, "StatusCode": 403, "Message": "Permission denied"});
                break;
            case config.dataResult:
                this.RemoveHeader(res);
                res.status(HttpStatus.OK);
                res.json(data);
                break;
            default:
                res.json({"Error": true, "Message": "Query not working..."});
                break;
        }
        
    },

    //Phan trang du lieu lay ve
    //data: du lieu lay ve
    //totalRow: tong so phan tu cua du lieu
    //page: trang hien tai
    //pageSize: so phan tu trong 1 trang
    PaginationSet: function(data, totalRow, page, pageSize, done){
        var model = {
            Items: data,
            Page: page,
            TotalCount: totalRow,
            TotalPages: (pageSize ==-1)? 1 : Math.ceil(totalRow/pageSize)
        };
        return done(model);
    },

    RemoveHeader: function(res, done){
        res.removeHeader('Transfer-Encoding');
        res.removeHeader('X-Powered-By');
        res.removeHeader('Access-Control-Allow-Origin');
        res.removeHeader('Access-Control-Allow-Methods');
        res.removeHeader('Access-Control-Allow-Headers');
        res.removeHeader('Accept-Language');
        res.removeHeader('content-type');
        res.removeHeader('Content-Length');
        res.removeHeader('ETag');
        res.removeHeader('Date');
        res.removeHeader('Connection');
    }
    
}
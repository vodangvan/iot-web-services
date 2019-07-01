var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.other.findAll({
            order: 'other_id DESC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.other.findAll({
            where: { other_name: {$like: '%'+ keyword + '%'}},
            order: 'other_name ASC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.other.findOne({where: {other_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByBillId: function(id, done){
        model.other.findAll({
            where: { bill_id: id},
            order: 'other_id ASC'
        }).then(function(data){
            return done(data);
        });
    },

    MapOther: function(body, done){        
        var dataNew = {
           bill_id: body.bill_id,
           other_name: body.other_name,
           other_price: body.other_price,
           other_quantity: body.other_quantity,
           other_note: body.other_note
        };
        model.other.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },
    MapOtherArray: function(body, done){
        var result ={
            arrData: [],
            arrError: [],
            lastRow: 0
        }
        body.others.forEach(function(element) {
            var dataNew = {
                bill_id: body.bill_id,
                other_name: element.other_name,
                other_price: element.other_price,
                other_quantity: element.other_quantity,
                other_note: element.other_note
            };
            model.other.build(dataNew).validate().then(function(error){
                if(error){
                    result.arrError.push(error);
                }                    
                else{
                    result.arrData.push(dataNew);
                }     
                result.lastRow +=1;
                if(result.lastRow == body.others.length){
                    if(result.arrError.length > 0){
                        return done(HttpStatus.BAD_REQUEST, result.arrError);
                    }else{
                        return done(HttpStatus.OK, result.arrData);
                    }
                }
            });
        }); 
    },

    Add: function(dataNew, done){
        model.other.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    AddMulti: function(arrDataNew, done){
        var result ={
            arrData: [],
            arrError: [],
            lastRow: 0
        }
        arrDataNew.forEach(function(dataElement){
            model.other.create(dataElement).then(function (data) {
                result.arrData.push(data);
                result.lastRow +=1;
                if(result.lastRow == arrDataNew.length){
                    if(result.arrError.length > 0){
                        return done(HttpStatus.BAD_REQUEST, result.arrError);
                    }else{
                        return done(HttpStatus.OK, result.arrData);
                    }
                }
            }).catch(function(error){
                result.arrError.push(error);
                result.lastRow +=1;
                if(result.lastRow == arrDataNew.length){
                    if(result.arrError.length > 0){
                        return done(HttpStatus.BAD_REQUEST, result.arrError);
                    }else{
                        return done(HttpStatus.OK, result.arrData);
                    }
                }
            });
        });        
    },

    Update: function(dataNew, id, done){
        model.other.update(dataNew,{
                where: {other_id: id}
            }).then(function(error){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.other.destroy({where:{other_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}
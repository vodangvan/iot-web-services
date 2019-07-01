var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.harvest_detail.findAll({
            order: 'harvest_id DESC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.harvest_detail.findAll({
            order: 'harvest_id DESC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetDetail: function(harvestId, prodtypeId, harvedetaNumber, done){
        model.harvest_detail.findOne({
            where: {
                harvest_id : harvestId,
                prodtype_id: prodtypeId,
                harvedeta_number: harvedetaNumber
            }
        }).then(function(data){                
            return done(data);
        });  
    },

    GetListByHarvestAndProductType: function(harvestId, prodtypeId, done){
        model.harvest_detail.findOne({
            where: {
                harvest_id : harvestId,
                prodtype_id: prodtypeId
            }
        }).then(function(data){                
            return done(data);
        });  
    },

    GetListByStockingAndPond: function(stockingId, pondId, done){
         var strQuery = 'SELECT `harvest_detail`.* ';
        strQuery    += ' FROM `harvest_detail` as `harvest_detail` JOIN `harvest` AS `harvest` ON `harvest_detail`.`harvest_id` = `harvest`.`harvest_id` '
        strQuery    += ' JOIN (SELECT * FROM `stocking` as st WHERE st.`stocking_id` = :stockingId ) AS `stocking` ON `harvest`.`stocking_id` = `stocking`.`stocking_id`';
        strQuery    += ' WHERE `harvest_detail`.`pond_id` = :pondId ORDER BY `harvest_detail`.`harvedeta_number`';
        model.sequelize.query(strQuery,{ replacements: { stockingId: stockingId, pondId: pondId  }, type: model.sequelize.QueryTypes.SELECT })
        .then(function(data) {
            return done(data);
        });
    },

    GetByHarvestId: function(id, done){
        model.harvest_detail.findAll({
            where: { harvest_id: id},
            order: 'harvest_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByProductTypeId: function(id, done){
        model.harvest_detail.findAll({
            where: { prodtype_id: id},
            order: 'harvest_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByPondId: function(id, done){
        model.harvest_detail.findAll({
            where: { pond_id: id},
            order: 'harvest_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    MapHarvestDetail: function(body, done){        
        var dataNew = {
           harvedeta_number: body.harvedeta_number,
           harvest_id: body.harvest_id,
           prodtype_id: body.prodtype_id,
           pond_id: body.pond_id,
           unit_id: body.unit_id,
           harvedeta_weight: body.harvedeta_weight,
           harvedeta_note: body.harvedeta_note,
           harvedeta_price: body.harvedeta_price
        };
        model.harvest_detail.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    MapHarvestDetailMulti: function(dataArr, havestID, done){
        var result ={
            arrData: [],
            arrError: [],
            lastRow: 0
        }
        dataArr.forEach(function(element) {
            var dataNew = {
                harvedeta_number: element.harvedeta_number,
                harvest_id: havestID,
                prodtype_id: element.prodtype_id,
                pond_id: element.pond_id,
                unit_id: element.unit_id,
                harvedeta_weight: element.harvedeta_weight,
                harvedeta_note: element.harvedeta_note,
                harvedeta_price: element.harvedeta_price
            };
            model.harvest_detail.build(dataNew).validate().then(function(error){
                if(error){
                    result.arrError.push(error);
                }                    
                else{
                    result.arrData.push(dataNew);
                }     
                result.lastRow +=1;
                if(result.lastRow == dataArr.length){
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
        model.harvest_detail.create(dataNew).then(function (data) {
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
            model.harvest_detail.create(dataElement).then(function (data) {
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

    Update: function(dataNew, harvestId, prodtypeId, harvedetaNumber, done){
        model.harvest_detail.update(dataNew,{
                where: {
                    harvest_id: harvestId,
                    prodtype_id: prodtypeId,
                    harvedeta_number: harvedetaNumber
                }
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, harvestId, prodtypeId, harvedetaNumber, done){
         model.harvest_detail.destroy({
            where:{
                harvest_id: harvestId,
                prodtype_id: prodtypeId,
                harvedeta_number: harvedetaNumber
            }
        }).then(function(data){
            return done(HttpStatus.OK, obj);
        }).catch(function(error){
            return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}
var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.material.findAll({
            order: 'material_name ASC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(userId, keyword, page = 0, pageSize, done){
        var strQuery = "SELECT m.*";
        strQuery += " FROM `user` AS u JOIN `bill` as b ON u.`user_id` = b.`user_id` AND u.`user_id` = :userID";
        strQuery += " JOIN `material` AS m ON b.`bill_id` = m.`bill_id`";        
        strQuery += " WHERE m.`material_name` LIKE :keyword ";
        model.sequelize.query(strQuery,{ replacements: { userID: userId, keyword: (keyword=="")?'%' : '%'+keyword+'%' }, type: model.sequelize.QueryTypes.SELECT })
        .then(function(data) {
            var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList); 
        });
      
    },

    GetById: function(id, done){
        model.material.findOne({where: {material_id : id,}}).then(function(data){                
            return done(data);
        });  
    },

    GetByMaterialTypeId: function(id, done){
        model.material.findAll({
            where: { materialtype_id: id},
            order: 'material_name ASC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByUnitId: function(id, done){
        model.material.findAll({
            where: { unit_id: id},
            order: 'material_name ASC'
        }).then(function(data){
            return done(data);
        });
    },
 
    GetByBillId: function(id, done){
        model.material.findAll({
            where: { bill_id: id},
            order: 'material_name ASC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByStocking: function(id, done){
        model.material.findAll({
            include:[
                {
                    model: model.bill,
                    where: {
                       stocking_id: id 
                    },
                    require: true,
                    attributes:['bill_id'],
                    as: 'Bill'
                }
            ],
            order: 'material_name ASC'
        }).then(function(data){
            return done(data);
        });
    },

    MapMaterial: function(body, done){        
        var dataNew = {
           materialtype_id: body.materialtype_id,
           unit_id: body.unit_id,
           bill_id: body.bill_id,
           material_name: body.material_name,
           material_numberOfLot: body.material_numberOfLot,
           material_source: body.material_source,
           material_quantity: body.material_quantity,
           material_existence: body.material_existence || 0,
           material_price: body.material_price,
           material_description: body.material_description,
           material_state: body.material_state || true,
        };
        model.material.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    MapMaterialArray: function(body, done){
        var result ={
            arrData: [],
            arrError: [],
            lastRow: 0
        }
        body.materials.forEach(function(element) {
            var dataNew = {
                materialtype_id: element.materialtype_id,
                unit_id: element.unit_id,
                bill_id: body.bill_id,
                material_name: element.material_name,
                material_numberOfLot: element.material_numberOfLot,
                material_source: element.material_source,
                material_quantity: element.material_quantity,
                material_existence: element.material_existence || 0,
                material_price: element.material_price,
                material_description: element.material_description,
                material_state: element.material_state || true,
            };
            model.material.build(dataNew).validate().then(function(error){
                if(error){
                    result.arrError.push(error);
                }                    
                else{
                    result.arrData.push(dataNew);
                }     
                result.lastRow +=1;
                if(result.lastRow == body.materials.length){
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
        model.material.create(dataNew).then(function (data) {
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
            model.material.create(dataElement).then(function (data) {
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
        model.material.update(dataNew,{
                where: {material_id: id}
            }).then(function(error){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.material.destroy({where:{material_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}
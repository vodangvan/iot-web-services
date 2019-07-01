var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.tracker_augmented.findAll({
            order: 'trackeraugmented_id DESC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(stockingId, pondId, keyword = '', page = 0, pageSize, done){
        model.tracker_augmented.findAll({
            where:{
                stocking_id: stockingId,
                pond_id: pondId
            },
            order: 'trackeraugmented_id DESC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.tracker_augmented.findOne({where: {trackeraugmented_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByPondId: function(id, done){
        model.tracker_augmented.findAll({
            where: { pond_id: id},
            order: 'trackeraugmented_number DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByPondAndStocking: function(pondId, stockingId, done){
        model.tracker_augmented.findAll({
            where: { 
                pond_id: pondId,
                stocking_id: stockingId
            },
            order: 'trackeraugmented_number DESC'
        }).then(function(data){
            return done(data);
        });
    },

    //Hàm trả về số lần theo dõi lớn nhất (gần nhất) theo ao
    //Nhận vào là id của ao
    //Trả về là số lớn nhất
    GetByMaxNumberForStockingPond: function(pondId, stockingId, done){
        model.tracker_augmented.max('trackeraugmented_number', {
            where: {
                pond_id: pondId,
                stocking_id: stockingId
            }
        }).then(function(data){
            return done(data);
        });
    },

    //Nhận vào là id của ao và số thứ tự lần theo dõi
    //Trả về true nếu tồn tại, false nếu ko tồn tại
    CheckExitsNumberNew: function(pondId, stockingId, number, done){
        model.tracker_augmented.findOne({
            where: {
                pond_id: pondId,
                stocking_id: stockingId,
                trackeraugmented_number: number
            }
        }).then(function(data){
            if(data)
                return done(true);
            else
                return done(false);
        });
    },

    //Nhận vào là id đợt theo dõi, id của ao và số thứ tự lần theo dõi
    //Trả về true nếu tồn tại, false nếu ko tồn tại
    CheckExitsNumberOld: function(trackeraugmentedId, pondId, number, done){
        model.tracker_augmented.findOne({
            where: {
                trackeraugmented_id:{
                    $ne: trackeraugmentedId
                },                
                pond_id: pondId,
                trackeraugmented_number: number
            }
        }).then(function(data){
            if(data)
                return done(true);
            else
                return done(false);
        });
    },

    MapTrackerAugmented: function(body, done){        
        var dataNew = {
           pond_id: body.pond_id,
           stocking_id: body.stocking_id,
           trackeraugmented_number: body.trackeraugmented_number,
           trackeraugmented_date: body.trackeraugmented_date,
           trackeraugmented_age: body.trackeraugmented_age,
           trackeraugmented_densityAvg: body.trackeraugmented_densityAvg,
           trackeraugmented_weightAvg: body.trackeraugmented_weightAvg,
           trackeraugmented_speedOfGrowth: body.trackeraugmented_speedOfGrowth,
           tracker_augmented_survival: body.tracker_augmented_survival,
           trackeraugmented_biomass: body.trackeraugmented_biomass,
           trackeraugmented_note: body.trackeraugmented_note || null
        };
        model.tracker_augmented.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.tracker_augmented.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.tracker_augmented.update(dataNew,{
                where: {trackeraugmented_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.tracker_augmented.destroy({where:{trackeraugmented_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}
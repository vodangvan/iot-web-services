"use strict"
var env = process.env.NODE_ENV || 'development',
    model = require('../models'),
    config = require('../config/config.json')[env];

var kValue = 5;
const KNN = require('ml-knn');

var GetAverage = function(first, second) {
    return (first + second) / 2;
}

var initTrainingData = function(calc) {

    //Data: Oxi hoa tan - pH - Nhiet do
    // Du lieu: [<oxi hoa tan>, <pH>, <Nhiet do>]
    var trainingData = [];
    /*Muc do danh gia:
     * 4: Rat tot
     * 3: Tren trung binh
     * 2: Duoi trung binh
     * 1: Rat te
     * 0: vat nuoi chet!!!
     */
    var trainingResult = [];

    // //5
    // trainingData.push([6.2, 7.75, 29]);
    // trainingResult.push([5]);

    // trainingData.push([5.5, 7.9, 28.8]);
    // trainingResult.push([5]);

    // trainingData.push([5.5, 7.6, 29.2]);
    // trainingResult.push([5]);

    // //4
    // trainingData.push([4.5, 6.75, 28.5]);
    // trainingResult.push([4]);

    // trainingData.push([4.5, 8.25, 28.5]);
    // trainingResult.push([4]);

    // trainingData.push([4.5, 6.75, 29.5]);
    // trainingResult.push([4]);

    // trainingData.push([4.5, 8.25, 29.5]);
    // trainingResult.push([4]);

    // trainingData.push([4.5, 8.5, 29.8]);
    // trainingResult.push([4]);

    // trainingData.push([4.5, 7.25, 29.8]);
    // trainingResult.push([4]);

    // trainingData.push([4.5, 8.5, 28.2]);
    // trainingResult.push([4]);

    // trainingData.push([4.5, 7.25, 28.2]);
    // trainingResult.push([4]);

    // //Dieu kien tren trung binh
    // trainingData.push([4, 9.5, 31]);
    // trainingResult.push([3]);

    // trainingData.push([4, 9.5, 26.5]);
    // trainingResult.push([3]);

    // trainingData.push([4, 9.2, 31]);
    // trainingResult.push([3]);

    // trainingData.push([4, 9.8, 26.5]);
    // trainingResult.push([3]);

    // trainingData.push([4, 5.75, 31]);
    // trainingResult.push([3]);

    // trainingData.push([4, 5.75, 26.5]);
    // trainingResult.push([3]);

    // trainingData.push([4, 5.25, 31]);
    // trainingResult.push([3]);

    // trainingData.push([4, 5.25, 26.5]);
    // trainingResult.push([3]);

    // //Dieu kien duoi trung binh
    // trainingData.push([3.5, 10.5, 33.5]);
    // trainingResult.push([2]);

    // trainingData.push([3.5, 10.5, 22.5]);
    // trainingResult.push([2]);

    // trainingData.push([3.5, 10.5, 32.5]);
    // trainingResult.push([2]);

    // trainingData.push([3.5, 10.5, 24.5]);
    // trainingResult.push([2]);

    // trainingData.push([3.5, 4.5, 32.5]);
    // trainingResult.push([2]);

    // trainingData.push([3.5, 4.5, 24.5]);
    // trainingResult.push([2]);

    // //Dieu kien xau
    // trainingData.push([3.4, 11.5, 35.5]);
    // trainingResult.push([1]);

    // trainingData.push([3.4, 11.5, 19.5]);
    // trainingResult.push([1]);

    // trainingData.push([3.4, 3.9, 35.5]);
    // trainingResult.push([1]);

    // trainingData.push([3.4, 3.9, 19.5]);
    // trainingResult.push([1]);

    // trainingData.push([3.4, 11.8, 35.2]);
    // trainingResult.push([1]);

    // trainingData.push([3.4, 11.8, 19.8]);
    // trainingResult.push([1]);

    // trainingData.push([3.4, 3.7, 35.2]);
    // trainingResult.push([1]);

    // trainingData.push([3.4, 3.7, 19.8]);
    // trainingResult.push([1]);

    // //Dieu kien rat xau
    // // trainingData.push([3, 12, 36]);
    // // trainingResult.push([0]);

    // // trainingData.push([3, 12, 19]);
    // // trainingResult.push([0]);

    // // trainingData.push([3, 3.5, 36]);
    // // trainingResult.push([0]);

    // // trainingData.push([3, 3.5, 19]);
    // // trainingResult.push([0]);

    model.knn_data.findAll().then(function(data) {
        if (data) {
            data.forEach(element => {
                trainingData.push([element.dataValues.knn_oxi, element.dataValues.knn_ph, element.dataValues.knn_temp]);
                trainingResult.push([element.dataValues.knn_evaluation]);
            });
            return calc(trainingData, trainingResult);
        }

    })

}



var mean = function(value) {
    switch (value) {
        case 5:
            return "Chất lượng nước hoàn hảo";
        case 4:
            return "Chất lượng nước rất tốt";
        case 3:
            return "Chất lượng nước ổn, tôm sinh trưởng chậm";
        case 2:
            return "Chất lượng nước tệ";
        case 1:
            return "Chất lượng nước rất tệ";
        case 0:
            return "Chất lượng nước gây nguy hiểm cho tôm";
    }
}

module.exports = {
    insertDatabase: function() {

        initTrainingData(function(trainingData, trainingResult) {
            for (var i = 0; i < trainingData.length; i++) {
                var oxi = trainingData[i][0];
                var ph = trainingData[i][1];
                var temp = trainingData[i][2];
                var result = trainingResult[i][0];
                var query = "INSERT INTO `knn_data` (`knn_id`, `knn_oxi`, `knn_ph`, `knn_temp`, `knn_nh4`, `knn_salinity`, `knn_evaluation`) VALUES (NULL, '" + oxi + "', '" + ph + "', '" + temp + "', NULL, NULL, '" + result + "');";
                model.sequelize.query(query, {
                    type: model.sequelize.QueryTypes.INSERT
                }).then(function(data) {});
            }
        })
    },
    Evaluate: function(oxi, pH, temp, nh4, done) {
        var ans;
        if (oxi <= 3 ||
            pH >= 12 || pH <= 3.5 ||
            temp <= 19 || temp >= 36) {
            var ans = {
                value: 0,
                mean: mean(0)
            };
            return done(ans);
        } else {
            initTrainingData(function(trainingData, trainingResult) {
                if (oxi > 6.2) {
                    oxi = 5.5;
                }
                var knn = new KNN(trainingData, trainingResult, { k: kValue });
                var result = knn.predict([oxi, pH, temp])[0];
                var ans = {
                    value: result,
                    mean: mean(result)
                };
                return done(ans);
            });
        }
    }
}
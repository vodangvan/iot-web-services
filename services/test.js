var qualityEvaluationService = require('./QualityEvaluationService');

var abc = qualityEvaluationService.Evaluate(3.8, 5.2, 31, 4.52, function(ans) {

    console.log(ans);
    console.log(1);
    return;
});


// qualityEvaluationService.insertDatabase();
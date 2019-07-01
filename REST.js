var express = require('express');
var account = require('./controller/accountController'),
    activity = require('./controller/activityController'),
    activityMaterial = require('./controller/activityMaterialController'),
    activityType = require('./controller/activityTypeController'),
    advice = require('./controller/adviceController'),
    age = require('./controller/ageController'),
    answerComment = require('./controller/answerCommentController'),
    auth = require('./controller/auth'),
    bill = require('./controller/billController'),
    blockNotification = require('./controller/blockNotificationController'),
    comment = require('./controller/commentController'),
    configType = require('./controller/configTypeController'),
    data = require('./controller/dataController'),
    datatype = require('./controller/dataTypeController'),
    feedback = require('./controller/feedbackController'),
    _function = require('./controller/functionController'),
    functionGroup = require('./controller/functionGroupController'),
    harvest = require('./controller/harvestController'),
    harvestDetail = require('./controller/harvestDetailController'),
    landBackground = require('./controller/landBackgroundController'),
    location = require('./controller/locationController'),
    locationManager = require('./controller/locationManagerController'),
    material = require('./controller/materialController'),
    materialPreparationDetail = require('./controller/materialPreparationDetailController'),
    materialType = require('./controller/materialTypeController'),
    media = require('./controller/mediaController'),
    notifi = require('./controller/notificationController'),
    other = require('./controller/otherController'),
    pond = require('./controller/pondController'),
    pondPreparation = require('./controller/pondPreparationController'),
    postCategory = require('./controller/postCategoryController'),
    post = require('./controller/postController'),
    productCategory = require('./controller/productCategoryController'),
    productType = require('./controller/productTypeController'),
    region = require('./controller/regionController'),
    river = require('./controller/riverController'),
    role = require('./controller/roleController'),
    seed = require('./controller/seedController'),
    seedQuality = require('./controller/seedQualityController'),
    sensor = require('./controller/sensorController'),
    sink = require('./controller/sinkController'),
    species = require('./controller/speciesController'),
    stationConfig = require('./controller/stationConfigController'),
    station = require('./controller/stationController'),
    stocking = require('./controller/stockingController'),
    stockingPond = require('./controller/stockingPondController'),
    stockingType = require('./controller/stockingTypeController'),
    threshold = require('./controller/thresholdController'),
    trackerAugmented = require('./controller/trackerAugmentedController'),
    unit = require('./controller/unitController'),
    user = require('./controller/userController'),
    userFunctionGroup = require('./controller/userFunctionGroupController'),
    userFunction = require('./controller/userFunctionController'),
    stationDefault = require('./controller/stationDefaultController'),
    friend = require('./controller/friendController'),
    reply = require('./controller/replyController'),
    thread = require('./controller/threadController'),
    chatGroup = require('./controller/chatGroupController'),
    vote = require('./controller/voteController'),
    message = require('./controller/messageController');

var routerAccount = express.Router(),
    routerActivity = express.Router(),
    routerActivityMaterial = express.Router(),
    routerActivityType = express.Router(),
    routerAdvice = express.Router(),
    routerAge = express.Router(),
    routerAnswerComment = express.Router(),
    routerAuth = express.Router(),
    routerBill = express.Router(),
    routerBlockNotifi = express.Router(),
    routerComment = express.Router(),
    routerConfigType = express.Router(),
    routerData = express.Router(),
    routerDataType = express.Router(),
    routerFeedback = express.Router(),
    routerFunction = express.Router(),
    routerFunctionGroup = express.Router(),
    routerHarvest = express.Router(),
    routerHarvestDetail = express.Router(),
    routerLandBackground = express.Router(),
    routerLocation = express.Router(),
    routerLocationManager = express.Router(),
    routerMaterial = express.Router(),
    routerMaterialPreparationDetail = express.Router(),
    routerMaterialType = express.Router(),
    routerMedia = express.Router(),
    routerNotifi = express.Router(),
    routerOther = express.Router(),
    routerPond = express.Router(),
    routerPondPreparation = express.Router(),
    routerPostCategory = express.Router(),
    routerPost = express.Router(),
    routerProductCategory = express.Router(),
    routerProductType = express.Router(),
    routerRegion = express.Router(),
    routerRiver = express.Router(),
    routerRole = express.Router(),
    routerSeed = express.Router(),
    routerSeedQuality = express.Router(),
    routerSensor = express.Router(),
    routerSink = express.Router(),
    routerSpecies = express.Router(),
    routerStationConfig = express.Router(),
    routerStation = express.Router(),
    routerStocking = express.Router(),
    routerStockingPond = express.Router(),
    routerStockingType = express.Router(),
    routerThreshold = express.Router(),
    routerTrackerAugmented = express.Router(),
    routerUnit = express.Router(),
    routerUser = express.Router(),
    routerUserFunction = express.Router(),
    routerUserFunctionGroup = express.Router(),
    routerStationDefault = express.Router(),
    routerFriend = express.Router(),
    routerThread = express.Router(),
    routerReply = express.Router(),
    routerChatGroup = express.Router(),
    routerMessage = express.Router(),
    routerVote = express.Router(),
    routerChatGroup = express.Router();

function REST_ROUTER(router) {
    var self = this;
    self.handleRoutes(router);
}

REST_ROUTER.prototype.handleRoutes = function(router) {
    var self = this;

    router.use('/account', routerAccount);
    self.accountController(routerAccount);

    router.use('/activity', routerActivity);
    self.activityController(routerActivity);

    router.use('/activitymaterial', routerActivityMaterial);
    self.activityMaterialController(routerActivityMaterial);

    router.use('/activitytype', routerActivityType);
    self.activityTypeController(routerActivityType);

    router.use('/advice', routerAdvice);
    self.adviceController(routerAdvice);

    router.use('/age', routerAge);
    self.ageController(routerAge);

    router.use('/answercomment', routerAnswerComment);
    self.answerCommentController(routerAnswerComment);

    router.use('/auth', routerAuth);
    self.auth(routerAuth);

    router.use('/bill', routerBill);
    self.billController(routerBill);

    router.use('/blocknotification', routerBlockNotifi);
    self.blockNotificationController(routerBlockNotifi);

    router.use('/comment', routerComment);
    self.commentController(routerComment);

    router.use('/configtype', routerConfigType);
    self.configTypeController(routerConfigType);

    router.use('/data', routerData);
    self.dataController(routerData);

    router.use('/datatype', routerDataType);
    self.dataTypeController(routerDataType);

    router.use('/feedback', routerFeedback);
    self.feedbackController(routerFeedback);

    router.use('/function', routerFunction);
    self.functionController(routerFunction);

    router.use('/functiongroup', routerFunctionGroup);
    self.functionGroupController(routerFunctionGroup);

    router.use('/harvest', routerHarvest);
    self.harvestController(routerHarvest);

    router.use('/harvestdetail', routerHarvestDetail);
    self.harvestDetailController(routerHarvestDetail);

    router.use('/landbackground', routerLandBackground);
    self.landBackgroundController(routerLandBackground);

    router.use('/location', routerLocation);
    self.locationController(routerLocation);

    router.use('/locationmanager', routerLocationManager);
    self.locationManagerController(routerLocationManager);

    router.use('/material', routerMaterial);
    self.materialController(routerMaterial);

    router.use('/materialpreparationdetail', routerMaterialPreparationDetail);
    self.materialPreparationDetailController(routerMaterialPreparationDetail);

    router.use('/materialtype', routerMaterialType);
    self.materialTypeController(routerMaterialType);

    router.use('/media', routerMedia);
    self.mediaController(routerMedia);

    router.use('/notification', routerNotifi);
    self.notificationController(routerNotifi);

    router.use('/other', routerOther);
    self.otherController(routerOther);

    router.use('/pond', routerPond);
    self.pondController(routerPond);

    router.use('/pondpreparation', routerPondPreparation);
    self.pondPreparationController(routerPondPreparation);

    router.use('/postcategory', routerPostCategory);
    self.postCategoryController(routerPostCategory);

    router.use('/post', routerPost);
    self.postController(routerPost);

    router.use('/productcategory', routerProductCategory);
    self.productCategoryController(routerProductCategory);

    router.use('/producttype', routerProductType);
    self.productTypeController(routerProductType);

    router.use('/region', routerRegion);
    self.regionController(routerRegion);

    router.use('/river', routerRiver);
    self.riverController(routerRiver);

    router.use('/role', routerRole);
    self.roleController(routerRole);

    router.use('/seed', routerSeed);
    self.seedController(routerSeed);

    router.use('/seedQuality', routerSeedQuality);
    self.seedQualityController(routerSeedQuality);

    router.use('/sensor', routerSensor);
    self.sensorController(routerSensor);

    router.use('/sink', routerSink);
    self.sinkController(routerSink);

    router.use('/species', routerSpecies);
    self.speciesController(routerSpecies);

    router.use('/stationconfig', routerStationConfig);
    self.stationConfigController(routerStationConfig);

    router.use('/station', routerStation);
    self.stationController(routerStation);

    router.use('/stocking', routerStocking);
    self.stockingController(routerStocking);

    router.use('/stockingpond', routerStockingPond);
    self.stockingPondController(routerStockingPond);

    router.use('/stockingtype', routerStockingType);
    self.stockingTypeController(routerStockingType);

    router.use('/threshold', routerThreshold);
    self.thresholdController(routerThreshold);

    router.use('/trackeraugmented', routerTrackerAugmented);
    self.trackerAugmentedController(routerTrackerAugmented);

    router.use('/unit', routerUnit);
    self.unitController(routerUnit);

    router.use('/user', routerUser);
    self.userController(routerUser);

    router.use('/userfunction', routerUserFunction);
    self.userFunctionController(routerUserFunction);

    router.use('/userfunctiongroup', routerUserFunctionGroup);
    self.userFunctionGroupController(routerUserFunctionGroup);

    router.use('/stationdefault', routerStationDefault);
    self.stationDefaultController(routerStationDefault);

    router.use('/friend', routerFriend);
    self.friendController(routerFriend);

    router.use('/reply', routerReply);
    self.replyController(routerReply);

    router.use('/thread', routerThread);
    self.threadController(routerThread);

    router.use('/chatgroup', routerChatGroup);
    self.chatGroupController(routerChatGroup);

    router.use('/vote', routerVote);
    self.voteController(routerVote);

    router.use('/message', routerMessage);
    self.messageController(routerMessage);
}



REST_ROUTER.prototype.accountController = function(router) {
    var accountController = new account(router);
}

REST_ROUTER.prototype.activityController = function(router) {
    var activityController = new activity(router);
}

REST_ROUTER.prototype.activityMaterialController = function(router) {
    var activityMaterialController = new activityMaterial(router);
}

REST_ROUTER.prototype.activityTypeController = function(router) {
    var activityTypeController = new activityType(router);
}

REST_ROUTER.prototype.adviceController = function(router) {
    var adviceController = new advice(router);
}

REST_ROUTER.prototype.ageController = function(router) {
    var ageController = new age(router);
}

REST_ROUTER.prototype.answerCommentController = function(router) {
    var answerCommentController = new answerComment(router);
}

REST_ROUTER.prototype.auth = function(router) {
    var authController = new auth(router);
}

REST_ROUTER.prototype.billController = function(router) {
    var billController = new bill(router);
}

REST_ROUTER.prototype.blockNotificationController = function(router) {
    var blockNotificationController = new blockNotification(router);
}

REST_ROUTER.prototype.commentController = function(router) {
    var commentController = new comment(router);
}

REST_ROUTER.prototype.configTypeController = function(router) {
    var configTypeController = new configType(router);
}

REST_ROUTER.prototype.dataController = function(router) {
    var dataController = new data(router);
}

REST_ROUTER.prototype.dataTypeController = function(router) {
    var dataTypeController = new datatype(router);
}

REST_ROUTER.prototype.feedbackController = function(router) {
    var feedbackController = new feedback(router);
}

REST_ROUTER.prototype.functionController = function(router) {
    var functionController = new _function(router);
}


REST_ROUTER.prototype.functionGroupController = function(router) {
    var functionGroupController = new functionGroup(router);
}

REST_ROUTER.prototype.harvestController = function(router) {
    var harvestController = new harvest(router);
}

REST_ROUTER.prototype.harvestDetailController = function(router) {
    var harvestDetailController = new harvestDetail(router);
}

REST_ROUTER.prototype.landBackgroundController = function(router) {
    var landBackgroundController = new landBackground(router);
}

REST_ROUTER.prototype.locationController = function(router) {
    var locationController = new location(router);
}

REST_ROUTER.prototype.locationManagerController = function(router) {
    var locationManagerController = new locationManager(router);
}

REST_ROUTER.prototype.materialController = function(router) {
    var materialController = new material(router);
}

REST_ROUTER.prototype.materialPreparationDetailController = function(router) {
    var materialPreparationDetailController = new materialPreparationDetail(router);
}

REST_ROUTER.prototype.materialTypeController = function(router) {
    var materialTypeController = new materialType(router);
}

REST_ROUTER.prototype.mediaController = function(router) {
    var mediaController = new media(router);
}

REST_ROUTER.prototype.notificationController = function(router) {
    var notificationController = new notifi(router);
}

REST_ROUTER.prototype.otherController = function(router) {
    var otherController = new other(router);
}

REST_ROUTER.prototype.pondController = function(router) {
    var pondController = new pond(router);
}

REST_ROUTER.prototype.pondPreparationController = function(router) {
    var pondPreparationController = new pondPreparation(router);
}

REST_ROUTER.prototype.postCategoryController = function(router) {
    var postCategoryController = new postCategory(router);
}

REST_ROUTER.prototype.postController = function(router) {
    var postController = new post(router);
}

REST_ROUTER.prototype.productCategoryController = function(router) {
    var productCategoryController = new productCategory(router);
}

REST_ROUTER.prototype.productTypeController = function(router) {
    var productTypeController = new productType(router);
}

REST_ROUTER.prototype.regionController = function(router) {
    var regionController = new region(router);
}

REST_ROUTER.prototype.riverController = function(router) {
    var riverController = new river(router);
}

REST_ROUTER.prototype.roleController = function(router) {
    var roleController = new role(router);
}

REST_ROUTER.prototype.seedController = function(router) {
    var seedController = new seed(router);
}

REST_ROUTER.prototype.seedQualityController = function(router) {
    var seedQualityController = new seedQuality(router);
}

REST_ROUTER.prototype.sensorController = function(router) {
    var sensorController = new sensor(router);
}

REST_ROUTER.prototype.sinkController = function(router) {
    var sinkController = new sink(router);
}

REST_ROUTER.prototype.speciesController = function(router) {
    var speciesController = new species(router);
}

REST_ROUTER.prototype.stationConfigController = function(router) {
    var stationConfigController = new stationConfig(router);
}

REST_ROUTER.prototype.stationController = function(router) {
    var stationController = new station(router);
}

REST_ROUTER.prototype.stockingController = function(router) {
    var stockingController = new stocking(router);
}

REST_ROUTER.prototype.stockingPondController = function(router) {
    var stockingPondController = new stockingPond(router);
}

REST_ROUTER.prototype.stockingTypeController = function(router) {
    var stockingTypeController = new stockingType(router);
}

REST_ROUTER.prototype.thresholdController = function(router) {
    var thresholdController = new threshold(router);
}

REST_ROUTER.prototype.trackerAugmentedController = function(router) {
    var trackerAugmentedController = new trackerAugmented(router);
}

REST_ROUTER.prototype.unitController = function(router) {
    var unitController = new unit(router);
}

REST_ROUTER.prototype.userController = function(router) {
    var userController = new user(router);
}

REST_ROUTER.prototype.userFunctionController = function(router) {
    var userFunctionController = new userFunction(router);
}

REST_ROUTER.prototype.userFunctionGroupController = function(router) {
    var userFunctionGroupController = new userFunctionGroup(router);
}

REST_ROUTER.prototype.stationDefaultController = function(router) {
    var stationDefaultController = new stationDefault(router);
}

REST_ROUTER.prototype.friendController = function(router) {
    var friendController = new friend(router);
}

REST_ROUTER.prototype.replyController = function(router) {
    var replyController = new reply(router);
}

REST_ROUTER.prototype.threadController = function(router) {
    var threadController = new thread(router);
}

REST_ROUTER.prototype.chatGroupController = function(router) {
    var chatGroupController = new chatGroup(router);
}

REST_ROUTER.prototype.messageController = function(router) {
    var messageController = new message(router);
}

REST_ROUTER.prototype.voteController = function(router) {
    var voteController = new vote(router);
}

module.exports = REST_ROUTER;
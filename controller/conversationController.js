var model = require('../models'),
    service = require('../services/Infrastructure'),
    conversationService = require('../services/ConversationService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config/config.json')[env];


function CONVERSATION_CONTROLLER(routerConversation) {
    var self = this;
    self.handleRoutes(routerConversation);
}

CONVERSATION_CONTROLLER.prototype.handleRoutes = function(routerConversation) {
    var self = this;
    //Lấy danh sách
}

module.exports = CONVERSATION_CONTROLLER;
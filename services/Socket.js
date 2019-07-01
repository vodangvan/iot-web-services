var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require("q"),
    env = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];
module.exports = {
    SendNotifiToClient: function(io, client_id, notifi) {
        io.emit(client_id, notifi);
    },

    SendDataToClient: function(io, stationType, pondId, riverId, stationId, dataNew) {
        //Sau khi thêm dữ liệu vào DB thì dữ liệu sẽ được gửi đến các client đang lắng nghe
        //Nếu là trạm cầm tay (data_stationType = 0) thì sẽ lắng nghe theo mã ao, sông
        //Nếu là trạm cố định (data_stationType = 1) thì sẽ lắng nghe theo mã trạm
        if (stationType == 0) {
            //Trạm cầm tay đo trên sông hay trên ao nuôi
            //Nếu đo trên ao thì lắng nghe theo mã data_type_station là 0, còn trên sông là 2
            if (pondId != null && pondId != undefined) {
                this.SendNotifiToClient(io, config.stationPondDynamic + pondId, dataNew);
            } else if (riverId != null && riverId != undefined) {
                this.SendNotifiToClient(io, config.stationSinkDynamic + riverId, dataNew);
            }
        } else {
            this.SendNotifiToClient(io, config.stationFixed + stationId, dataNew);
        }
    },

    SendMessageToClient: function(io, conversationId, dataNew, done) {
        console.log(config.conversationID + conversationId);
        this.SendNotifiToClient(io, config.conversationID + conversationId, dataNew);
        return done(dataNew);
    },

    SendNewReplyToThread: function(io, dataNew) {
        console.log(dataNew);
        this.SendNotifiToClient(io, "thread_" + dataNew.thread_id, dataNew);
    },

    SendNewReplyToUser: function(io, userId, dataNew) {
        console.log(dataNew);
        this.SendNotifiToClient(io, "thread_user_" + userId, dataNew);
    }

}
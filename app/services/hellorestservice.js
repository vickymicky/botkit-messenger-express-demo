var request = require('request')
var quickreply = require('../templates/fb/quickreply')

var hellorestservice = function() {}

hellorestservice.prototype.getResponse = function(userId) {
    // Sample code on how to call rest service
    // request.post(
    //     'http://www.yoursite.com/formpage', { json: { key: 'value' } },
    //     function(error, response, body) {
    //         if (!error && response.statusCode == 200) {
    //             console.log(body)
    //         }
    //     }
    // )
    
    var reply = new quickreply(userId, "Are you fine ?")
    reply.addQuickReply("text", "yes", "I am fine")
    reply.addQuickReply("text", "no", "I am not fine")
    return reply.getJSON()
}

module.exports = hellorestservice

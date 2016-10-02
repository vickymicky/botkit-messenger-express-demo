var helloservice = require('../services/helloservice')
var hellorestservice = require('../services/hellorestservice')


var hellobot = function(controller, bot, app) {
    // user said hi
    controller.hears(['hi'], 'message_received', function(bot, message) {
        //'Hi, How are you. ' + app.locals.appName 
        
        var replyFromViewObject = new hellorestservice().getResponse(message.user)
        // var reply_message = {
        //     sender_action: "typing_on"
        // }

        // bot.reply(message, reply_message)

        bot.reply(message, replyFromViewObject)
    })

    controller.hears('test', 'message_received', function(bot, message) {

        var attachment = {
            'type': 'template',
            'payload': {
                'template_type': 'generic',
                'elements': [{
                    'title': 'Chocolate Cookie',
                    'image_url': 'http://cookies.com/cookie.png',
                    'subtitle': 'A delicious chocolate cookie',
                    'buttons': [{
                        'type': 'postback',
                        'title': 'Eat Cookie',
                        'payload': 'chocolate'
                    }]
                }, ]
            }
        }

        bot.reply(message, {
            attachment: attachment,
        })

    })

    controller.on('facebook_postback', function(bot, message) {

        if (message.payload == 'chocolate') {
            bot.reply(message, 'You ate the chocolate cookie!')
        }

    })
}

module.exports = hellobot

var helloservice = require('../services/helloservice')
var hellorestservice = require('../services/hellorestservice')


var hellobot = function(controller, bot, app) {

    var hellorestserviceObj = new hellorestservice()
    // user said hi
    controller.hears(['hi'], 'message_received', function(bot, message) {
        //'Hi, How are you. ' + app.locals.appName 

        var replyFromViewObject = hellorestserviceObj.getResponse(message.user)
            // var reply_message = {
            //     sender_action: "typing_on"
            // }

        // bot.reply(message, reply_message)

        bot.reply(message, replyFromViewObject)
    })

    controller.hears(['hello i18n'], 'message_received', function(bot, message) {
        bot.reply(message, 'I will reply in tamil')
        i18n.setLocale('ta')
        var i18nMsg =  i18n.__('Hello i18n')
        bot.reply(message, i18nMsg)
    })

    controller.hears('test postback', 'message_received', function(bot, message) {

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

    controller.hears('test webview', 'message_received', function(bot, message) {

        var attachment = {
            'type': 'template',
            'payload': {
                'template_type': 'generic',
                'elements': [{
                    'title': 'Test Webview',
                    'buttons': [{
                        "type": "web_url",
                        "url": "https://bbot.localtunnel.me/sampleview",
                        "title": "Select Criteria",
                        "webview_height_ratio": "compact",
                        "messenger_extensions": true,
                        "fallback_url": "https://bbot.localtunnel.me"
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

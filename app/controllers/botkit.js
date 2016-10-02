/* eslint-disable brace-style */
/* eslint-disable camelcase */
// CONFIG===============================================
/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit')
var mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/botkit-demo'
var db = require('../../config/db')({ mongoUri: mongoUri })
var request = require('request')
var fs = require('fs')
var Path = require('path')
var app = require('../../server')
var winston = require('winston')

var controller = Botkit.facebookbot({
    logger: new winston.Logger({
        levels: winston.config.syslog.levels,
        transports: [
            new(winston.transports.Console)(),
            new(winston.transports.File)({ filename: 'bot.log' })
        ]
    }),
    debug: true,
    access_token: process.env.FACEBOOK_PAGE_TOKEN,
    verify_token: process.env.FACEBOOK_VERIFY_TOKEN,
    storage: db
})

var bot = controller.spawn({})

// subscribe to page events
request.post('https://graph.facebook.com/me/subscribed_apps?access_token=' + process.env.FACEBOOK_PAGE_TOKEN,
    function(err, res, body) {
        if (err) {
            controller.log('Could not subscribe to page messages')
        } else {
            controller.log('Successfully subscribed to Facebook events:', body)
            console.log('Botkit activated')

            // start ticking to send conversation messages
            controller.startTicking()
        }
    }
)

request({
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: {
            "setting_type": "domain_whitelisting",
            "whitelisted_domains": ["https://bbot.localtunnel.me"],
            "domain_action_type": "add"
        },
        uri: 'https://graph.facebook.com/v2.6/me/thread_settings?access_token=' + process.env.FACEBOOK_PAGE_TOKEN,
    },
    function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
)

// this is triggered when a user clicks the send-to-messenger plugin
controller.on('facebook_optin', function(bot, message) {
    bot.reply(message, 'Welcome, friend')
})

// user said hello
controller.hears(['helo'], 'message_received', function(bot, message) {
    bot.reply(message, 'Hey there.')
})

// user says anything else
// controller.hears('(.*)', 'message_received', function (bot, message) {
//   bot.reply(message, 'you said ' + message.match[1])
// })

var loadPlugins = function() {
    var pluginsPath = Path.resolve(__dirname, '../plugins')
    var files = fs.readdirSync(pluginsPath)
    for (var i in files) {
        var file = files[i]
        const ext = Path.extname(file)
        const full = Path.join(pluginsPath, Path.basename(file, ext))
        try {
            // eslint-disable-next-line global-require
            const plugin = require(full)
            if (typeof plugin === 'function') {
                plugin(controller, bot, app)
                console.log('Plugin Loaded: ' + file)
            } else {
                console.log('Expected ${full} to assign a function to module.exports, got ${typeof plugin}')
            }
        } catch (error) {
            console.log('Unable to load ${full}: ${error.stack}')
            process.exit(1)
        }

    }

}

// this function processes the POST request to the webhook
var handler = function(obj) {
    //An example of accessing global variables using app object
    controller.debug('GOT A MESSAGE HOOK ')
    var message
    if (obj.entry) {
        for (var e = 0; e < obj.entry.length; e++) {
            for (var m = 0; m < obj.entry[e].messaging.length; m++) {
                var facebook_message = obj.entry[e].messaging[m]

                console.log(facebook_message)
                bot.say({
                        text: 'my message text'
                    })
                    // normal message
                if (facebook_message.message) {
                    message = {
                        text: facebook_message.message.text,
                        user: facebook_message.sender.id,
                        channel: facebook_message.sender.id,
                        timestamp: facebook_message.timestamp,
                        seq: facebook_message.message.seq,
                        mid: facebook_message.message.mid,
                        attachments: facebook_message.message.attachments
                    }

                    // save if user comes from m.me adress or Facebook search
                    create_user_if_new(facebook_message.sender.id, facebook_message.timestamp)

                    controller.receiveMessage(bot, message)
                }
                // clicks on a postback action in an attachment
                else if (facebook_message.postback) {
                    // trigger BOTH a facebook_postback event
                    // and a normal message received event.
                    // this allows developers to receive postbacks as part of a conversation.
                    message = {
                        payload: facebook_message.postback.payload,
                        user: facebook_message.sender.id,
                        channel: facebook_message.sender.id,
                        timestamp: facebook_message.timestamp
                    }

                    controller.trigger('facebook_postback', [bot, message])

                    message = {
                        text: facebook_message.postback.payload,
                        user: facebook_message.sender.id,
                        channel: facebook_message.sender.id,
                        timestamp: facebook_message.timestamp
                    }

                    controller.receiveMessage(bot, message)
                }
                // When a user clicks on "Send to Messenger"
                else if (facebook_message.optin) {
                    message = {
                        optin: facebook_message.optin,
                        user: facebook_message.sender.id,
                        channel: facebook_message.sender.id,
                        timestamp: facebook_message.timestamp
                    }

                    // save if user comes from "Send to Messenger"
                    create_user_if_new(facebook_message.sender.id, facebook_message.timestamp)

                    controller.trigger('facebook_optin', [bot, message])
                }
                // message delivered callback
                else if (facebook_message.delivery) {
                    message = {
                        optin: facebook_message.delivery,
                        user: facebook_message.sender.id,
                        channel: facebook_message.sender.id,
                        timestamp: facebook_message.timestamp
                    }

                    controller.trigger('message_delivered', [bot, message])
                } else {
                    controller.log('Got an unexpected message from Facebook: ', facebook_message)
                }
            }
        }
    }
}

var create_user_if_new = function(id, ts) {
    controller.storage.users.get(id, function(err, user) {
        if (err) {
            console.log(err)
        } else if (!user) {
            controller.storage.users.save({ id: id, created_at: ts })
        }
    })
}

loadPlugins()

exports.handler = handler
    /* eslint-disable brace-style */
    /* eslint-disable camelcase */

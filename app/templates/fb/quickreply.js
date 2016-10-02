var quickreply = function(userId, mainText) {
    this.userId = userId
    this.mainText = mainText
    this.quickReplies = []
}

quickreply.prototype.addQuickReply = function(cnt_type, title, payload) {
    var replyJSON = {
        "content_type": cnt_type,
        "title": title,
        "payload": payload
    }
    this.quickReplies.push(replyJSON)
}

quickreply.prototype.getJSON = function() {
    var json = {
        // "recipient": {
        //     "id": this.userId
        // },
        // "message": {
            "text": this.mainText,
            "quick_replies": this.quickReplies
        // }
    }
    return json
}

module.exports = quickreply

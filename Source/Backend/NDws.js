var wsclient = require('./ws');

var NDWebSocket = function (wsurl) {

    this.ws = new wsclient(wsurl);

    this.onopen = null;
    this.onerror = null;
    this.onclose = null;
    this.onmessage = null;

    Object.defineProperty(this,"binaryType",{
        get () {
            return this.ws.binaryType;
        },
        set (newValue) {
            this.ws.binaryType = newValue;
        }});

    let self  = this;
    let event = {};

    this.ws.on('open', function () {
        if(self.onopen)
            self.onopen(event);
    });
    this.ws.on('message', function (data, flags) {
        event.data = data;
        if(self.onmessage) self.onmessage(event);
    });
    this.ws.on("error", function (err) {
        if(self.onerror) self.onerror(err);
    });
    this.ws.on("close" ,function (code,msg) {
        if(self.onclose) {
            event.code = code;
            event.msg = msg;
            self.onclose(event);
        }
    });
}

NDWebSocket.prototype.close = function (code,msg) {
    if(this.ws)
        this.ws.close(code,msg);
}

NDWebSocket.prototype.send = function (data) {
    if(this.ws) {
        this.ws.send(data);
    }
}

module.exports = NDWebSocket;


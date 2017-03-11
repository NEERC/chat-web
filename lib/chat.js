var XMPP = require('stanza.io');
var WildEmitter = require('wildemitter');

function Chat() {
    var self = this;

    this.client = XMPP.createClient();

    this.client.use(require('./neerc'));

    this.client.on('session:started', function () {
        self.client.sendPresence();
        self.client.getUsers();
        self.client.getTasks();
        self.client.joinRoom(self.room, self.client.jid.local);
    });

    this.client.on('muc:join', function () {
        self.emit('online');
    });

    this.client.on('disconnected', function () {
        self.emit('offline');
    });

    this.client.on('groupchat', function (msg) {
        self.emit('message', {
            from: msg.from.resource,
            text: msg.body
        });
    });

    this.client.on('neerc:users', function (users) {
        self.users = {};

        users.forEach(function (user) {
            self.users[user.name] = {
                group: user.group,
                power: user.power,
                online: false
            };
        });

        self.emit('users');
    });

    this.client.on('neerc:tasks', function (tasks) {
        self.tasks = {};

        tasks.forEach(function (task) {
            self.tasks[task.id] = task;
        });

        self.emit('tasks');
    });

    this.client.on('neerc:task', function (task) {
        if (task.type === 'remove') {
            delete self.tasks[task.id];
            self.emit('task:deleted', task.id);
        } else {
            self.tasks[task.id] = task;
            self.emit('task:updated', task.id);
        }
    });

    this.client.on('*', function (e, m) {
        console.log(JSON.stringify(e) + ": " + JSON.stringify(m));
    });
}

WildEmitter.mixin(Chat);

Chat.prototype.connect = function (opts) {
    this.room = (opts.room || "neerc") + "@conference." + opts.server;

    this.client.connect({
        jid: opts.username + '@' + opts.server,
        password: opts.password,

        transport: 'websocket',
        wsURL: opts.wsURL
    });
};

Chat.prototype.disconnect = function () {
    this.client.disconnect();
};

Chat.prototype.sendMessage = function (text) {
    this.client.sendMessage({
        to: this.room,
        type: 'groupchat',
        body: text
    });
};

module.exports = Chat;

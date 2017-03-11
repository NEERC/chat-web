var Chat = require('./lib/chat');
var store = require('store');

var chat = new Chat();

chat.on('online', function () {
    $('#loginButton').button('reset');
    $('#loginDialog').modal('hide');
    $('#status').text('online');
});

chat.on('offline', function () {
    $('#loginButton').button('reset');
    $('#loginDialog').modal();
    $('#status').text('offline');
});

chat.on('message', function (msg) {
    $(document.createElement('p'))
        .text(msg.from + ': ' + msg.text)
        .appendTo('#chat');
});

chat.on('users', function () {
    $('#roster').empty();

    for (var name in chat.users) {
        $(document.createElement('li'))
            .attr('id', 'user_' + name)
            .attr('class', 'list-group-item')
            .text(name)
            .appendTo('#roster');
    }
});

function updateTask(task) {
    var item = $('#task_' + task.id);

    if (!item.length) {
        item = $(document.createElement('li'))
            .attr('id', 'task_' + task.id)
            .attr('class', 'list-group-item')
            .appendTo('#tasks');
    } else {
        item.empty();
    }

    item.text(task.title);

    var statusList = $(document.createElement('ul')).appendTo(item);

    task.statuses.forEach(function (status) {
        $(document.createElement('li'))
            .text(status.for + ' ' + status.type + ' ' + status.value)
            .appendTo(statusList);
    });
}

chat.on('tasks', function () {
    var tasks = $('#tasks');
    tasks.empty();

    for (var id in chat.tasks) {
        updateTask(chat.tasks[id]);
    }
});

chat.on('task:updated', function (id) {
    updateTask(chat.tasks[id]);
});

chat.on('task:deleted', function (id) {
    $('#task_' + id).remove();
});

$('#message').submit(function (e) {
    var input = $('#messageInput');
    var text = input.val().trim();
    if (text != '') {
        chat.sendMessage(text);
        input.val('');
    }
    e.preventDefault();
});

function login() {
    $('#loginButton').button('loading');

    var user = {
        username: $('#username').val(),
        password: $('#password').val(),
        server: $('#server').val(),
        wsURL: $('#wsURL').val()
    }

    var remember = $('#remember').prop('checked');

    if (remember) {
        store.set('user', user);
    }

    chat.connect(user);
}

function logout() {
    store.remove('user');
    chat.disconnect();
}

$('#loginButton').on('click', login);
$('#logoutButton').on('click', logout);

$('#loginDialog').modal();

var user = store.get('user');
if (user) {
    $('#username').val(user.username);
    $('#password').val(user.password);
    $('#server').val(user.server);
    $('#wsURL').val(user.wsURL);
    $('#remember').prop('checked', true);
    login();
}

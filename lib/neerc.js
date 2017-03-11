module.exports = function (client, stanzas) {
    var types = stanzas.utils;

    var Users = stanzas.define({
        name: 'users',
        namespace: 'http://neerc.ifmo.ru/protocol/neerc#users',
        element: 'query'
    });

    var User = stanzas.define({
        name: '_user',
        namespace: 'http://neerc.ifmo.ru/protocol/neerc#users',
        element: 'user',
        fields: {
            name: types.attribute('name'),
            group: types.attribute('group'),
            power: types.attribute('power')
        }
    });

    var Tasks = stanzas.define({
        name: 'tasks',
        namespace: 'http://neerc.ifmo.ru/protocol/neerc#tasks',
        element: 'query'
    });

    var Tasks_Task = stanzas.define({
        name: '_task',
        namespace: 'http://neerc.ifmo.ru/protocol/neerc#tasks',
        element: 'task',
        fields: {
            title: types.attribute('title'),
            type: types.attribute('type'),
            id: types.attribute('id')
        }
    });

    var Task_TaskStatus = stanzas.define({
        name: '_taskStatus',
        namespace: 'http://neerc.ifmo.ru/protocol/neerc#tasks',
        element: 'status',
        fields: {
            for: types.attribute('for'),
            type: types.attribute('type'),
            value: types.attribute('value')
        }
    });

    var TaskExtension = stanzas.define({
        name: 'taskExtension',
        namespace: 'http://neerc.ifmo.ru/protocol/neerc#tasks',
        element: 'x'
    });

    var Task = stanzas.define({
        name: 'task',
        namespace: 'http://neerc.ifmo.ru/protocol/neerc#tasks',
        element: 'task',
        fields: {
            title: types.attribute('title'),
            type: types.attribute('type'),
            id: types.attribute('id')
        }
    });

    stanzas.extend(Users, User, 'list');

    stanzas.extendIQ(Users);

    stanzas.extend(Tasks_Task, Task_TaskStatus, 'statuses');
    stanzas.extend(Tasks, Tasks_Task, 'list');

    stanzas.extendIQ(Tasks);

    stanzas.extend(Task, Task_TaskStatus, 'statuses');
    stanzas.extend(TaskExtension, Task);

    stanzas.extendMessage(TaskExtension);

    client.getUsers = function () {
        client.sendIq({
            to: 'neerc.' + client.config.server,
            type: 'get',
            users: {}
        });
    }

    client.getTasks = function () {
        client.sendIq({
            to: 'neerc.' + client.config.server,
            type: 'get',
            tasks: {}
        });
    }

    client.on('iq', function (iq) {
        if (iq.users) {
            var users = iq.users.list;
            users.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            client.emit('neerc:users', users);
        }

        if (iq.tasks) {
            client.emit('neerc:tasks', iq.tasks.list);
        }
    });

    client.on('message', function (msg) {
        if (msg.taskExtension) {
            client.emit('neerc:task', msg.taskExtension.task);
        }
    });
}

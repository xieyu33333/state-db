import mock from '@utils/mock';

//reply的参数为 (status, data, headers)
mock.onGet('/<%= name%>').reply(200, {
    code: 200,
    data: [
        {id: 1, content: '第一件事情', completed: 1},
        {id: 2, content: '第二件事情', completed: 0},
        {id: 3, content: '第三件事情', completed: 0},
        {id: 4, content: '第四件事情', completed: 0}
    ]
});

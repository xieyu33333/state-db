import React from 'react';
import TodoEntry from './todo/container/TodoContainer';

const routes = [
    {
        path: '/',
        exact: true,
        component: TodoEntry
    },
    {
        path: '/test',
        exact: true,
        component: () => <div>test</div>
    }
];

export default routes;

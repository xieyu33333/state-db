/*
 * 测试schema功能是否符合预期
 */

import db from './init.js';

db.createTable({
    name: 'test_schema',
    schema: {
        id: { type: 'Number', required: true },
        name: { type: 'String', required: true },
        age: { type: 'Number', required: true },
        todos: { type: 'Array', required: false },
    },
    pramaryKey: 'id',
    initValue: [{
        id: 1,
        name: 'wang',
        age: 11,
        todos: []
    }]
})
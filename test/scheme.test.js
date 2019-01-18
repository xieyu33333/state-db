/*
 * 测试scheme功能是否符合预期
 */

import db from './init.js';

db.createTable({
    name: 'test_scheme',
    scheme: {
        id: { type: 'Number', required: true },
        name: { type: 'String', required: true },
        age: { type: 'Number', required: true },
        todos: { type: 'Array', required: false },
    },
    initValue: [{
        id: 1,
        name: 'wang',
        age: 11,
        todos: []
    }]
})

var test_scheme = db.table('test_scheme');

//id 类型不对，无法插入
test('id type not right', () => {
    test_scheme.insert({
        id: '1',
        name: 'wang',
        age: 11,
        todos: []
    })
    expect(test_scheme.count()).toBe(1);
});



// id 类型不对的，无法插入, 正确的可以插入
test('id type not right 02', () => {
    test_scheme.insert([
        {
            id: '1',
            name: 'wang',
            age: 11,
            todos: []
        },
        {
            id: 2,
            name: '小刘',
            age: 11,
            todos: []
        }
    ])
    expect(test_scheme.count()).toBe(2);
});

//不填ID，无法插入
test('no id', () => {
    test_scheme.insert({
        name: 'wang',
        age: 11,
        todos: []
    });
    expect(test_scheme.count()).toBe(2);
});


// 不填todo, 可以插入
test('no todo', () => {
    test_scheme.insert({
        id: 3,
        name: 'lee',
        age: 11,
    });
    expect(test_scheme.count()).toBe(3);
});

// 填写一个scheme里未定义的key,可以插入
test('a no scheme column', () => {
    test_scheme.insert({
        id: 4,
        name: 'zhao',
        age: 11,
        test: 'test'
    });
    expect(test_scheme.count()).toBe(4);
});
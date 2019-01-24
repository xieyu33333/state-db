/*
 * 测试schema功能是否符合预期
 */

import db from './init.js';

db.createTable({
    name: 'test_schema',
    schema: {
        name: { type: 'String', required: true },
        age: { type: 'Number', required: true },
    },
    primaryKey: {name: 'id', autoIncrement: 1},
    initValue: [{
        id: 1,
        name: 'wang',
        age: 11
    }]
})

const schemaTestTable = db.table('test_schema');

test('insert muti success', () => {
    var ids = schemaTestTable.insert([
        {
            name: 'test5',
            age: 11
        },
        {
            name: 'test6',
            age: 11
        },
        {
            name: 'test7',
            age: 11
        }
    ]);
    expect(ids.length).toBe(3);
    expect(schemaTestTable.count()).toBe(4);
    expect(schemaTestTable.where('line.id==2').count()).toBe(1);
    expect(schemaTestTable.where('line.id==3').count()).toBe(1);
    expect(schemaTestTable.where('line.id==4').count()).toBe(1);
});

test('insert one success', () => {
    var ids = schemaTestTable.insert({
        name: 'test6',
        age: 12
    });
    expect(ids.length).toBe(1);
    expect(schemaTestTable.count()).toBe(5);
    expect(schemaTestTable.where('line.id==5').count()).toBe(1);
});
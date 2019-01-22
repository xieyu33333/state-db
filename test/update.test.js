/*
 * 测试 update 功能是否符合预期
 */

import db from './init.js';

db.createTable({
    name: 'test_update',
    initValue: [{
        id: 1,
        name: 'wang',
        age: 11,
    },
    {
        id: 2,
        name: 'liu',
        age: 11,
    },
    {
        id: 3,
        name: 'lee',
        age: 11,
    }]
})

var test_update = db.table('test_update');

test('update one line', () => {
    test_update.where('line.id == 1').update({
        name: 'wanghao',
        age: 11
    })
    expect(test_update.where('line.id == 1').getValues()[0].name).toBe('wanghao');
});

test('update one line', () => {
    test_update.update({
        name: 'wanghaoqi',
        age: 11
    })
    expect(test_update.where('line.id == 1').getValues()[0].name).toBe('wanghaoqi');
    expect(test_update.where('line.id == 2').getValues()[0].name).toBe('liu');
});

test('update all line', () => {
    test_update.updateAll({
        name: 'wanghaoqi',
        age: 11
    })
    expect(test_update.where('line.id == 1').getValues()[0].name).toBe('wanghaoqi');
    expect(test_update.where('line.id == 2').getValues()[0].name).toBe('wanghaoqi');
    expect(test_update.where('line.id == 3').getValues()[0].name).toBe('wanghaoqi');
});

test('update by key', () => {
    test_update.updateByKey([{
        id: 2,
        name: 'liu',
        age: 11
    }, {
        id: 3,
        name: 'lee',
        age: 11
    }], 'id')
    expect(test_update.where('line.id == 1').getValues()[0].name).toBe('wanghaoqi');
    expect(test_update.where('line.id == 2').getValues()[0].name).toBe('liu');
    expect(test_update.where('line.id == 3').getValues()[0].name).toBe('lee');
});
import db from './init.js';

var test1Table = db.table('test1');

test('insert success', () => {
    test1Table.insert({
        name: 'test4',
        age: 11
    })
    expect(test1Table.count()).toBe(4);
});

test('insert muti success', () => {
    test1Table.insertAll([
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
    expect(test1Table.count()).toBe(7);
});
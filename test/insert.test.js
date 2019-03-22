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
    test1Table.insert([
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

test('insert by key muti success', () => {
    test1Table.insert([
        {
            name: 'test5',
            age: 12
        },
    ], 'name');
    expect(test1Table.count()).toBe(7);
    expect(test1Table.where('line.name=="test5"').getValues()[0].age).toBe(12);
});

test('insert by key success', () => {
    test1Table.insert({
            name: 'test5',
            test: 1,
            age: 13
        }, 'name');
    expect(test1Table.count()).toBe(7);
    expect(test1Table.where('line.name=="test5"').getValues()[0].age).toBe(13);
    test1Table.insert({
        name: 'test5',
        age: 14,
        grade: 1
    }, 'name');
    expect(test1Table.count()).toBe(7);
    expect(test1Table.where('line.name=="test5"').getValues()[0].age).toBe(14);
    expect(test1Table.where('line.name=="test5"').getValues()[0].grade).toBe(1);
    expect(test1Table.where('line.name=="test5"').getValues()[0].test).toBe(1);
});


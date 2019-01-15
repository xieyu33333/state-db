import db from './init.js';

var test1Table = db.table('test1');



test('init one line', () => {
    test1Table.init([{
        name: 'test4',
        age: 11
    }])
    expect(test1Table.count()).toBe(1);
});


test('init muti line', () => {
    test1Table.init([
        {
            name: 'test4',
            age: 11
        },
        {
            name: 'test5',
            age: 12
        }
    ]);
    expect(test1Table.count()).toBe(2);
});
import db from './init.js';

var test1Table = db.table('test1');


test('delete name = test1', () => {
    var arr = test1Table.where('line.name=="test1"').delete();
    expect(test1Table.values.length).toBe(2);
    expect(test1Table.values[0].name).toBe("test2");
    expect(test1Table.values[1].name).toBe("test3");
});

test('delete all', () => {
    var arr = test1Table.delete();
    expect(test1Table.values.length).toBe(0);
});
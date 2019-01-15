import db from './init.js';

var test1Table = db.table('test1');



test('get name = test1', () => {
    var arr = test1Table.where('line.name=="test1"').getValues();
    expect(arr.length).toBe(1);
    expect(arr[0].name).toBe("test1");
});


test('change arr not change db', () => {
    var arr = test1Table.where('line.name=="test1"').getValues();
    arr[0].name = 'aaa';

    var arr1 = test1Table.where('line.name=="aaa"').getValues();
    expect(arr1.length).toBe(0);
    // expect(arr[0].name).toBe("test1");
});


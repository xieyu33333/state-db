import db from './init.js';

var test1Table = db.table('test1');



test('get name = test1', () => {
    var arr = test1Table.where('line.name=="test1"').getValues();
    expect(arr.length).toBe(1);
    expect(arr[0].name).toBe("test1");
});


test('change arr not change db & use safe Mode', () => {
    var arr = test1Table.where('line.name=="test1"').getValues('safe');
    arr[0].name = 'aaa';

    var arr1 = test1Table.where('line.name=="aaa"').getValues('safe');
    expect(arr1.length).toBe(0);
    // expect(arr[0].name).toBe("test1");
});

test('key in Arr', () => {
    var arr = test1Table.in('name', ['test1', 'test3']).getValues();
    expect(arr.length).toBe(2);
    expect(arr[1].name).toBe("test3");
});


test('get first 2 value', () => {
    var arr = test1Table.first(2).getValues();
    expect(arr.length).toBe(2);
    expect(arr[1].name).toBe("test2");
});

test('get last 2 value', () => {
    var arr = test1Table.last(2).getValues();
    expect(arr.length).toBe(2);
    expect(arr[1].name).toBe("test3");
});


test('get last 2 value use values', () => {
    var arr = test1Table.last(2).values;
    expect(arr.length).toBe(2);
    expect(arr[1].name).toBe("test3");
});

test('get name = test1  use values', () => {
    var arr = test1Table.where('line.name=="test1"').values;
    var arr1 = test1Table.where('line.name=="test1"').values;
    expect(arr.length).toBe(1);
    expect(arr[0].name).toBe("test1");
    expect(arr1.length).toBe(1);
    expect(arr1[0].name).toBe("test1");
    test1Table.insert({
        name: 'test1',
        age: 11
    });
    var arr3 = test1Table.where('line.name=="test1"').values;

    expect(arr3.length).toBe(2);
    expect(arr3[0].name).toBe("test1");
});




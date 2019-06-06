import db from './init.js';

db.createTable({
    name: 'test_chain',
    initValue: [{
        id: 1,
        name: 'wang',
        age: 11,
    },
    {
        id: 2,
        name: 'liu',
        age: 12,
    },
    {
        id: 3,
        name: 'lee',
        age: 13,
    },
    {
        id: 4,
        name: 'lee2',
        age: 13,
    }

    ]
})

var test_update = db.table('test_chain');

test('update one line use eq', () => {
    test_update.eq('id', 1).update({
        name: 'wanghao'
    })
    expect(test_update.eq('id', 1).getValues()[0].name).toBe('wanghao');
    expect(test_update.version).toBe(2);
});

test('chain use eq', () => {
    test_update.eq('id', 2).update({age: 13});
    expect(test_update.eq('age', 13).getValues()[0].name).toBe('liu');
    expect(test_update.eq('age', 13).eq('id', 4).getValues()[0].name).toBe('lee2');
    expect(test_update.version).toBe(3);
});

test('chain use filter', () => {
    // test_update.eq('id', 2).update({age: 13});
    expect(test_update.filter('age','===', 13).getValues()[0].name).toBe('liu');
    expect(test_update.filter('age', '===',  13).filter('id', '===', 4).getValues()[0].name).toBe('lee2');
    expect(test_update.version).toBe(3);
});

// test('update one line', () => {
//     test_update.update({
//         name: 'wanghaoqi',
//         age: 11
//     })
//     expect(test_update.where('line.id == 1').getValues()[0].name).toBe('wanghaoqi');
//     expect(test_update.where('line.id == 2').getValues()[0].name).toBe('liu');
// });

// test('update all line', () => {
//     test_update.updateAll({
//         name: 'wanghaoqi',
//         age: 11
//     })
//     expect(test_update.where('line.id == 1').getValues()[0].name).toBe('wanghaoqi');
//     expect(test_update.where('line.id == 2').getValues()[0].name).toBe('wanghaoqi');
//     expect(test_update.where('line.id == 3').getValues()[0].name).toBe('wanghaoqi');
// });

// test('update by key', () => {
//     test_update.updateByKey([{
//         id: 2,
//         name: 'liu',
//         age: 11
//     }, {
//         id: 3,
//         name: 'lee',
//         age: 11
//     }], 'id')
//     expect(test_update.where('line.id == 1').getValues()[0].name).toBe('wanghaoqi');
//     expect(test_update.where('line.id == 2').getValues()[0].name).toBe('liu');
//     expect(test_update.where('line.id == 3').getValues()[0].name).toBe('lee');
// });
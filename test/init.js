import DB from '../src/db.js';
const db = new DB({
    onError : (err, passData) => false,
    onMessage : (msg) => false,
    onChange : (msg, table, type, data) => false,
    onQuery : (msg, table, query, data) => false
});

db.createTable({
    name: 'test1',
    initValue: [
        {name: 'test1', age: 10},
        {name: 'test2', age: 10},
        {name: 'test3', age: 10}
    ]
});

export default db;
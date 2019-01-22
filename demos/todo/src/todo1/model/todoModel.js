import db from  '../../db.js';

export default () => {
    const startTodos = [
        {id: 1, content: '第1件事情', completed: 1},
        {id: 2, content: '第2件事情', completed: 0},
        {id: 3, content: '第3件事情', completed: 0},
        {id: 4, content: '第4件事情', completed: 0}
    ];

    /*
     * 进入一块独立业务，先清除所有状态
     * 建表，一个是todo的数据表，一个是保存页面本地一些业务状态
     */
    // db.clear();
    db.createTable({
        name: 'state01',
        initValue: {key: "showState", value: "all"}
    });
    db.createTable({
        name: 'todo01',
        initValue: startTodos
    });

    const dropTable = db.drop;
    const connector = db.dbconnectReact;
    const todoTable = db.table('todo01');
    const stateTable = db.table('state01');

    //增加一个todo
    const addTodo = (value) => {
        todoTable.insert({id: Math.random(), content: value, completed: 0});
    }

    //获取todo数量
    const getTodoCount = () => {
        return todoTable.count();
    }

    const getShowState = () => {
        const line = stateTable.where('line.key == \"showState\"').values;
        return line[0] ? line[0].value : 'all';
    }

    const setShowState = (value) => {
        stateTable.where('line.key == \"showState\"').update({key: "showState", value: value});
    }

    const getTodos = (state) => {
        if (state === 'active') {
            return todoTable.where('line.completed === 0').values;
        }
        else if (state === 'completed') {
            return todoTable.where('line.completed === 1').values;
        }
        else {
            return todoTable.values;
        }
    }

    const updateTodo = (todo) => {
        todoTable.where('line.id == ' + todo.id).update(todo);
    }

    const delTodo = (id) => {
        todoTable.where('line.id == '+ id).delete();
    }

    return {dropTable, addTodo, getTodoCount, getShowState, setShowState, getTodos, updateTodo, delTodo};
}

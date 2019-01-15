import React, {Component} from 'react';
import TodoItem from './TodoItemComponent';
import {connector, stateTable, todoTable, getShowState, getTodos} from '../model/todoModel';

@connector(stateTable, todoTable)
export default class TodoContainer extends Component {
    render() {
        let showClass = getShowState();
        console.log(getTodos(showClass), showClass);
        return (
            <section className="main">
                <input id="toggle-all" className="toggle-all" type="checkbox" />
                <label htmlFor="toggle-all">Mark all as complete</label>
                <ul className="todo-list">
                    {getTodos(showClass).map(todo => (
                        <TodoItem key={todo.id} todo={todo} />
                    ))}
                </ul>
            </section>
        );
    }
}
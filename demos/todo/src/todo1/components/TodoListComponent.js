import React, {Component} from 'react';
import TodoItem from './TodoItemComponent';
import db from '../../db.js';

@db.dbconnectReact('state01', 'todo01')
export default class TodoContainer extends Component {

    render() {
        const {stateTable, todoTable, getShowState, getTodos} = this.props.model;
        const {model} = this.props;
        let showClass = getShowState();
        return (
            <section className="main">
                <input id="toggle-all" className="toggle-all" type="checkbox" />
                <label htmlFor="toggle-all">Mark all as complete</label>
                <ul className="todo-list">
                    {getTodos(showClass).map(todo => (
                        <TodoItem key={todo.id} todo={todo} model={model}/>
                    ))}
                </ul>
            </section>
        );
    }
}
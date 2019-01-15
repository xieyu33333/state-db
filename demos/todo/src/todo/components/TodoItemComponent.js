import React, {Component} from 'react';
import {stateTable, delTodo, getShowState, updateTodo} from '../model/todoModel';

export default (props) => {
    const {todo} = props;
    const toggleCheck = () => {
        todo.checked = !todo.checked;
        todo.completed = todo.checked ? 1 : 0;
        updateTodo(todo);
    };

    const deleteTodo = () => {
        delTodo(todo.id);
    };

    return (
        <li className={todo.completed ? 'completed' : ''}>
            <div>
                <input className="toggle" type="checkbox" onChange={toggleCheck} checked={todo.checked} />
                <label>{todo.content}</label>
                <button className="destroy" onClick={deleteTodo} />
            </div>
        </li>
    );
}

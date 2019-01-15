import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {addTodo, todoTable} from '../model/todoModel';

export default class TodoInputComponent extends Component {
    constructor(props) {
        super(props);
        // todoTable.bindFn(() => this.setState());
    }
    render() {
        return (
            <header className="header">
                <h1>todos</h1>
                <input
                    className="new-todo"
                    placeholder="What needs to be done?"
                    ref="newField"
                    onKeyDown={this.handleNewTodoKeyDown}
                    autoFocus={true}
                />
            </header>
        );
    }

    handleNewTodoKeyDown = event => {
        if (event.keyCode !== 13) {
            return;
        }

        event.preventDefault();

        var val = ReactDOM.findDOMNode(this.refs.newField).value.trim();

        if (val) {
            addTodo(val);
            ReactDOM.findDOMNode(this.refs.newField).value = '';
        }
    };
}

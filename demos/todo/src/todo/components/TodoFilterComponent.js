import React, {Component} from 'react';
import {connector, setShowState, getShowState, stateTable, todoTable, getTodoCount} from '../model/todoModel';

@connector(todoTable, stateTable)
export default class TodoContainer extends Component {
    render() {
        return (
            <footer className="footer">
                <span className="todo-count">
                    <strong>{getTodoCount()}</strong> item left
                </span>
                <ul className="filters">
                    <li>
                        <a className={this.getClassName('all')} onClick={ this.setShowState('all') }>
                            ALL
                        </a>
                    </li>
                    <li>
                        <a className={this.getClassName('active')} onClick={ this.setShowState('active') }>
                            Active
                        </a>
                    </li>
                    <li>
                        <a className={this.getClassName('completed')} onClick={ this.setShowState('completed') }>
                            Completed
                        </a>
                    </li>
                </ul>
                <button className="clear-completed" onClick={this.deleteAll}>
                    Clear completed
                </button>
            </footer>
        );
    }

    getClassName = (state) => {
        return getShowState() === state ? 'selected' : ''
    }
    setShowState = (showState) => {
        return () => setShowState(showState)
    }

    deleteAll = () => {
        //model.deleteCompletedTodo(showState)
    };
}

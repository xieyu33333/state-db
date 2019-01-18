import React, {Component} from 'react';
import db from '../../db.js';

@db.dbconnectReact('todo01', 'state')
export default class TodoContainer extends Component {
    render() {
        const { setShowState, getShowState, getTodoCount} = this.props.model;
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
        const { getShowState } = this.props.model;
        return getShowState() === state ? 'selected' : ''
    }
    setShowState = (showState) => {
        const { setShowState } = this.props.model;
        return () => setShowState(showState)
    }

    deleteAll = () => {
        //model.deleteCompletedTodo(showState)
    };
}

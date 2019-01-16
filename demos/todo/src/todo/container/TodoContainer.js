import React, {Component} from 'react';
import TodoFilter from '../components/TodoFilterComponent';
import TodoList from '../components/TodoListComponent';
import TodoInput from '../components/TodoInputComponent';
import FooterInfo from '../components/FooterInfoComponent';
import '../style/todo.less';

export default () => {
    return (
        <div id="todo">
            <section className="todoapp">
                <TodoInput />
                <TodoList />
                <TodoFilter />
                <FooterInfo />
            </section>
        </div>
    );
}

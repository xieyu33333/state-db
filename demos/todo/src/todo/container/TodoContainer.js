import React, {Component} from 'react';
import TodoFilter from '../components/TodoFilterComponent';
import TodoList from '../components/TodoListComponent';
import TodoInput from '../components/TodoInputComponent';
import FooterInfo from '../components/FooterInfoComponent';
import '../style/todo.css';

export default () => {
    return (
        <section className="todoapp">
            <TodoInput />
            <TodoList />
            <TodoFilter />
            <FooterInfo />
        </section>
    );
}

import React, {Component} from 'react';
import TodoFilter from '../components/TodoFilterComponent';
import TodoList from '../components/TodoListComponent';
import TodoInput from '../components/TodoInputComponent';
import FooterInfo from '../components/FooterInfoComponent';
import '../style/todo.less';
import todoModle from '../model/todoModel';

export default class Todo extends Component  {


    constructor(props) {
        super(props);
        this.model = todoModle();
    }

    componentWillUnmount() {
        this.model.dropTable('state01');
        this.model.dropTable('todo01');
    }
    render() {
        return (
            <div id="todo">
                <section className="todoapp">
                    <TodoInput model={this.model}/>
                    <TodoList model={this.model}/>
                    <TodoFilter model={this.model}/>
                    <FooterInfo model={this.model}/>
                </section>
            </div>
        )
    }
}

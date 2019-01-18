import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {HashRouter, Route, Link} from 'react-router-dom';
// import {renderRoutes} from 'react-router-config';
// import routers from './router';
import db from './db';
import TodoEntry from './todo/container/TodoContainer';
import Todo1Entry from './todo1/container/TodoContainer';
window.db2 = db;
class Admin extends Component {
    constructor(props) {
        super(props);
        db.createTable({
            name: 'state1',
            initValue: {key: "adminState", value: Math.random()}
        });
        this.getValue = () => db.table('state1').getValues()[0].value
    }
    componentWillUnmount() {
        db.drop('state1');
    }


    render() {
        return <div>{this.getValue()}</div>;
    }

}

ReactDOM.render(
    <HashRouter>
        <div>
            <ul>
                <li>
                    <Link to='/todo'>todo</Link>
                </li>
                <li>
                    <Link to='/todo1'>todo1</Link>
                </li>
                <li>
                    <Link to='/admin'>admin</Link>
                </li>
            </ul>
            <Route exact path="/todo" component={TodoEntry} />
            <Route exact path="/todo1" component={Todo1Entry} />
            <Route exact path="/admin" component={Admin} />
        </div>
    </HashRouter>, document.getElementById('root'));

document.getElementById('loading').style.display = 'none';

if (module.hot) {
    module.hot.accept();
}

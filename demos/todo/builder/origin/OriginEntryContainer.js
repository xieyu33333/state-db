import React, {Component} from 'react';
import {observer} from 'mobx-react';
import <%= Name%>Store from '../stores/<%= name%>Store';
import <%= Name%> from './<%= Name%>Container.js';

const store = new <%= Name%>Store();

@observer
export default class <%= Name%>Container extends Component {
    render() {
        return <<%= Name%> store={store} />;
    }
}

import React, {Component} from 'react';
import {observer} from 'mobx-react';

//规范：需要用 __DEV__ 来判断是否加载DevTool,以保证不会打包到正式环境
let DevTool = () => null;
if (__DEV__) {
    DevTool = require('mobx-react-devtools').default;
}

@observer
export default class <%= Name%>Container extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.store.init<%= Name%>Data();
    }

    render() {
        const {store} = this.props;
        // console.log(store.testData[0].content);
        return (
            <section className="todoapp">
                <DevTool />
                {store.testData.map(item => {
                    return <li>{item.content}</li>;
                })}
            </section>
        );
    }
}

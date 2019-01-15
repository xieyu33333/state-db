import {observable, action, computed, reaction} from 'mobx';
import axios from 'axios';
import '../mock/testMock';

class testStore {
    @observable
    <%= name%>Data = [];

    @action
    init<%= Name%>Data() {
        const init = async () => {
            const res = await axios('/test');
            const saved = res.data.data;
            this.<%= name%>Data = saved;
        };
        init();
    }
}

export default <%= name%>Store;

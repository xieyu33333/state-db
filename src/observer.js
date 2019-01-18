import {isArray, isObj, isFunction} from './utils';

class Observer {
    constructor() {
        this.actions = [];
    }

    on = (name, fn) => {
        if (isFunction(fn)) {
            var actionArr = this.actions['on' + name]
            if (isArray(actionArr) && !actionArr.includes(fn)) {
                actionArr.push(fn);
            }
            else {
                this.actions['on' + name] = [fn];
            }
        }
    }

    off = (name, fn) => {
        var actionArr = this.actions['on' + name];
        if (actionArr) {
            if (!fn) {
                actionArr = null;
            }
            else {
                var index = actionArr.indexOf(fn);
                if (index > -1) {
                    actionArr.splice(index, 1);
                }
            }
        }
    }

    trigger = (name, params) => {
        const fnList = this.actions['on' + name];

        if (fnList && fnList.length) {
            for (var i = 0; i < fnList.length; i++) {
                fnList[i](params);
            }
        }
    }
}

export default Observer
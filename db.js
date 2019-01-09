isArray = (v) => Object.prototype.toString.call(v) === "[object Array]"

isObj = (v) => Object.prototype.toString.call(v) === "[object Object]"

class Register {
    constructor() {
        this.actions = [];
    }

    on = (name, fn) => {
        if (this.actions['on' + name]) {
            this.actions['on' + name].push(fn);
        }
        else {
            this.actions['on' + name] = [fn];
        }
    }

    off = (name, fn) => {
        var actionArr = this.actions['on' + name];
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

    trigger = (name, params) => {
        const fnList = this.actions['on' + name];

        if (fnList && fnList.length) {
            for (var i = 0; i < fnList.length; i++) {
                fnList[i](params);
            }
        }
    }
}

class Table {
    constructor(name, scheme, initValue) {
        this.scheme = scheme || false;
        this.data = [];
        this.name = name;
        this.register = new Register();
        if (isArray(initValue)) {
            this.init(initValue);
        }
        else if (isObj(initValue)) {
            this.insert(initValue);
        }

        this.tmp = this.data;
    }

    where = (...args) => {
        this.tmp = this.tmp.filter((line) => {
            //eval('return item[args[0]]' + args[1] + args[2])
            return eval(args[0]);
            // return item["key"] == "content";
        })
        console.log(this.tmp);
        return this;
    }

    orderby = (column) => {

    }

    insert = (data) => {
        if (!this.scheme) {
            this.data.push(Object.assign({}, data));
        }
        this.register.trigger(this.name);
        return [];
    }

    insertAll = (arr) => {
        if (!this.scheme) {
            this.data.push(data);
        }
        this.register.trigger(this.name);
        return [];
    }

    init = (arr) => {
        if (!this.scheme) {
            this.data = [].concat(arr);
        }
        this.register.trigger(this.name);
        return [];
    }

    update = (obj) => {
        Object.keys(obj).forEach(key => this.tmp[0][key] = obj[key])
        this.register.trigger(this.name);
        return 'success';
    }

    updateAll = (obj) => {
        return [];
    }


    delete = () => {
        return [];
    }

    getValues = (columns) => {
        if (!columns) {
            return [].concat(this.tmp);
        }
        else if (columns instanceof Array) {

        }

    }

    bindFn = (fn) => {
        this.register.on(this.name, fn);
        return this;
    }

    unbindFn = (fn) => {
        this.register.off(this.name, fn);
        return this;
    }
}


class DB {
    constructor() {
        this.tables = {};
    }

    createTable = (name, scheme, initValue) => {
        const table = new Table(name, scheme, initValue);
        this.tables[name] = table
    }

    table = (name) => {
        const table = this.tables[name];
        if (!table) {
            console.log('找不到表' + name);
        }
        else {
            return table
        }

    }

    drop = (name) => {
        this.tables[name] = null;
    }

    clear = () => {
        this.tables = {};
    }
}


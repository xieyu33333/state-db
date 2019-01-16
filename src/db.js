import {isArray, isObj, isFunction, isString} from './utils';
import Table from './table';
import Observer from './observer';

const tables = Symbol('tables');

const defaultOpts = {
    onError : (err, passData) => console.error(err, passData),
    onMessage : (msg, data) => console.log(msg, data),
    onChange : (msg, table, type, data) => console.log(msg, table, type, data),
    onQuery : (msg, table, query, data) => console.log(msg, table, query, data)
}

class DB {
    constructor(opts = {}) {
        this[tables] = {};
        this.opts = Object.assign(defaultOpts, opts);
        this.register = new Observer();
    }

    // 快速关联db和react组件的高阶组件 @db.dbconnectReact(table1, table2, table3)
    dbconnectReact = (...args) => {
        var self = this;
        return target => {
            return class Inheritance extends target {
                constructor(props) {
                    super(props);
                    this.fnList = []
                    args.forEach(tableName => {
                        var fn = () => this.setState({});
                        var table = isString(tableName) ? self.table(tableName) : tableName;
                        table.bindFn(fn);
                        this.fnList.push({table: table, fn: fn})
                    });
                }
                componentWillUnmount = () => {
                    super.componentWillUnmount();
                    this.fnList.forEach(fnMap => {
                        fnMap.table.unbindFn(fnMap.fn);
                    });
                }
            }
        }
    }

    createTable = (opts) => {
        if (!isObj(opts)) {
            this.opts.onError('createTable must pass in an Object', opts);
            return;
        }
        if (!opts.name) {
            this.opts.onError('opts.name is required', opts);
            return;
        }
        if (this[tables][opts.name]) {
            this.opts.onError('opts.name are already exists', opts);
            return;
        }
        opts.dbOpts = this.opts
        const table = new Table(opts);
        this[tables][opts.name] = table;
        this.register.trigger('db_event', Object.assign(opts, {type: 'create_table'}));
    }

    table = (name) => {
        const table = this[tables][name];
        if (!table) {
            console.log('Can not find table ' + name);
        }
        else {
            return table
        }

    }

    getTables = () => {
        return this[tables];
    }

    drop = (name) => {
        this[tables][name] = null;
        this.register.trigger('db_event', {tablename: name, type: 'drop_table'});
    }

    clear = () => {
        this[tables] = {};
        this.register.trigger('db_event', {type: 'clear'});
    }

    bindFn = (fn) => {
        this.register.on('db_event', fn);
    }

    unbindFn = (fn) => {
        this.register.off('db_event', fn);
    }
}

export default DB;
import {isArray, isObj, isFunction, isString, getType} from './utils';
import Observer from './observer';

/*
 * 使用Symbol增强对属性的保护
 */
const store = Symbol('store');
const tmp = Symbol('tmp');

class Table {
    constructor(opts={}) {
        this.schema = opts.schema || false;
        //暂未实现， loose: 不符合要求的行不插入，其他正常插入。 strict: 只要有不符合要求的都不允许插入。
        this.schemaMode = opts.schemaMode || 'loose';
        /*
         * saveMode：插数据库前的处理模式：
         * safe：深度clone default
         * unsafe: 不处理,
         * normal: 浅copy
         */
        this.saveMode = opts.saveMode || 'safe';
        this.columns = [];
        this.queryCache = {};
        this[store] = [];
        this.name = opts.name;
        this.dbOpts = opts.dbOpts || {};
        this.version = 0;
        this.setPrimaryKey = () => {};
        this.checkschema = () => true;
        if (isObj(this.schema)) {
            this.checkschema = (line) => {
                for (var i in this.schema) {
                    if (this.schema[i].required && line[i] === undefined) {
                        return false;
                    }
                    if (this.schema[i].type && line[i] !== undefined){
                        if (getType(line[i]) !== this.schema[i].type) {
                            return false;
                        }
                    }
                }
                return true;
            };
        }

        if (isString(opts.primaryKey)) {
            this.primaryKey = opts.primaryKey;
        }
        else if (isObj(opts.primaryKey)) {
            this.primaryKey = opts.primaryKey.name || 'key';
            if (opts.primaryKey.autoIncrement) {
                this.setPrimaryKey = (line, value) => {
                    let data = this[store];
                    let primaryKey = this.primaryKey;
                    if (!value) {
                        if (data.length) {
                            line[primaryKey] = data[data.length - 1][primaryKey] + 1;
                        }
                        else {
                            line[primaryKey] = 1;
                        }
                    }
                    else {
                        line[primaryKey] = value;
                    }
                }
            }
        }

        //数组或者对象存入数据库之前的处理： safe：深度clone, unsafe: 不处理, normal: 浅copy
        this._beforeSave = (obj) => {
            if (this.saveMode === 'safe') {
                return JSON.parse(JSON.stringify(obj));
            }
            else if (this.saveMode === 'unsafe') {
                return obj;
            }
            if (isArray(obj)) {
                return obj.concat([]);
            }
            else if (isObj(obj)) {
                return Object.assign({}, obj);
            }
        }

        this.register = new Observer();

        /*
         * 数据库发生变化后，queryCache清空
         */
        this.register.on(this.name, () => {
            this.queryCache = {};
        });
        if (isArray(opts.initValue)) {
            this.init(opts.initValue);
        }
        else if (isObj(opts.initValue)) {
            this.insert(opts.initValue);
        }

        this[tmp] = this[store];
    }

    _commonOnChange = (message) => {
        this.version++;
        this[tmp] = this[store];
        this.register.trigger(this.name, message);
    }

    /*
     * 支持链式调用，但不支持多个where链式调用
     */
    where = (query) => {
        this[tmp] = this[store].filter((line, index) => {
            return eval(query);
        });
        /*
         * 将当前query缓存一下，下次操作被覆盖
         */
        this.currentQuery = query.trim();

        return this;
    }

    first = (n) => {
        this[tmp] = this[tmp].filter((line, index) => {
            return index < n;
        })
        return this;
    }

    last = (n) => {
        this[tmp] = this[tmp].filter((line, index) => {
            return index > this[store].length - n - 1;
        })
        return this;
    }

    eq = (k, v) => {
        this[tmp] = this[tmp].filter((line, index) => {
            return line[k] === v;
        })
        return this;
    }

    in = (k, arr) => {
        this[tmp] = this[tmp].filter((line, index) => {
            return arr.indexOf(line[k]) > -1;
        })
        return this;
    }

    filter = (k, compare, v) => {
        this[tmp] = this[tmp].filter((line, index) => {
            if (compare === '==='){
                return line[k] === v;
            }
            if (compare === '==='){
                return line[k] === v;
            }
            if (compare === '>='){
                return line[k] >= v;
            }
            if (compare === '<='){
                return line[k] <= v;
            }
            if (compare === '>'){
                return line[k] > v;
            }
            if (compare === '<'){
                return line[k] < v;
            }
        })
        return this;
    }

    /*
     * 根据某一个字段的值进行默认行为排序
     */
    orderby = (column = primaryKey) => {
        if (column) {
            this[tmp].sort((a, b) => {
                var columnA = a[column]
                var columnB = b[column]
                if (columnA < columnB) {
                    return -1;
                }
                if (columnA > columnB) {
                    return 1;
                }
                return 0;
            });
        }
    }

    /*
     * 返回查找到的数组，不使用缓存
     */
    getValues = (type) => {
        let result = this[tmp];
        this[tmp] = this[store];
        if ( type === 'safe') {
            return JSON.parse(JSON.stringify(result));
        }
        else if (!type || type === 'unsafe' || type === 'view'){
            return result;
        }
    }

    /*
     * 返回查找到的数组, 并且会使用缓存, 因为主要用于快速取值，所采用unsafe模式，需注意
     */
    get values() {
        let result = this[tmp];
        this[tmp] = this[store];
        /*
         * 优先使用缓存值，当执行增删改操作后，缓存会清除
         */
        const cacheValue = this.queryCache[this.currentQuery];

        if (cacheValue) {
            return cacheValue;
        }
        else {
            this.queryCache[this.currentQuery] = result;
            return this.queryCache[this.currentQuery];
        }
    }

    /*
     * 返回查询后数组长度
     */
    count = () => {
        let result = this[tmp];
        this[tmp] = this[store];

        return result.length;
    }

    /*
     * 返回整体数组长度
     */
    countAll = () => {
        return this[store].length;
    }

    /*
     * 初始化表,如果表在创建时指定了schema，需要对数组字段进行强校验
     */
    init = (arr = []) => {
        var lines = this._beforeSave(arr);
        this[store].length = 0;
        lines.forEach((item) => {
            if (this.checkschema(item)) {
                this[store].push(item);
            }
        });
        this._commonOnChange(); //触发更新广播
        this.dbOpts.onChange('Table ' + this.name + ' init Success', this, 'init', lines);
        return this;
    }

    /*
     * 通用的插入单条方法，仅内部使用, 如果有指定key，则可能进行update操作
     */
    _insert = (line, key) => {
        const data = this[store];
        const filterKey = key || this.primaryKey;
        if (this.checkschema(line)) {
            this.setPrimaryKey(line);
            if (!isString(filterKey)) {
                data.push(line);
                return line[filterKey] || true;
            }
            else {
                for (let i = 0; i < data.length; i++) {
                    if (data[i][filterKey] === line[filterKey]) {
                        // data[i] = line;
                        Object.keys(line).forEach(key => data[i][key] = line[key])
                        return line[filterKey] || true;
                    }
                }
                data.push(line);
                return line[filterKey] || true;
            }
        }
    }
    /*
     * 插入一条或多条数据, 如果有key, 则可能进行update操作
     */
    insert = (item, key) => {
        const keys = [];
        if (isObj(item)) {
            var line = this._beforeSave(item);
            var kv = this._insert(line, key)
            if (!kv) {
                this.dbOpts.onError('Insert item not match the schema.', item);
            }
            else {
                this.register.trigger(this.name, {type: 'insert', count: 1, insertCount: 1});
                this.dbOpts.onChange('Table ' + this.name + ' insert Success', this, 'init', item);
                keys.push(kv);
            }
        }
        else if (isArray(item)) {
            var lines = this._beforeSave(item);
            var insertCount = 0;
            lines.forEach(line => {
                var kv = this._insert(line, key)
                if (kv) {
                    insertCount += 1;
                    keys.push(kv);
                }
            })
            if (insertCount) {
                this._commonOnChange({type: 'insert', count: item.length, insertCount: insertCount})
            }
            else {
                this.dbOpts.onError('All Insert item not match the schema.', item);
            }
        }
        else {
            this.dbOpts.onError('Insert item type must be array or object', item);
        }
        return keys;

    }


    /*
     * 将where语句查询到的条目进行update, 但只update查到的第一条
     */
    update = (obj) => {
        let result = this[tmp];
        this[tmp] = this[store];
        var obj = this._beforeSave(obj);

        if (result[0]) {
            Object.keys(obj).forEach(key => result[0][key] = obj[key]);
            this._commonOnChange({type: 'update'});
            return 'update success';
        }
        else {
            return 'Not Find Update Target.';
        }
    }

    /*
     * 将where语句查询到的全部条目update成同一个值
     */
    updateAll = (obj) => {
        let result = this[tmp];
        this[tmp] = this[store];
        var obj = this._beforeSave(obj);

        result.forEach(item => {
            Object.keys(obj).forEach(key => item[key] = obj[key])
        });
        this._commonOnChange({type: 'update'});
        return 'update success';

    }

    /*
     * 将where语句查询到的全部条目跟传入的数字进行key对比，key值相同的进行update
     */
    updateByKey = (arr, key) => {
        if (!isArray(arr) || !isString(key)) {
            this.dbOpts.onError('updateByKey first param should be array, second param should be string', [arr, key]);
            return;
        }
        let result = this[tmp];
        this[tmp] = this[store];
        var arr = this._beforeSave(arr);

        result.forEach(line => Object.assign(line, arr.find(item => item[key] == line[key])));

        this._commonOnChange({type: 'update'});
        return 'updateByKey success';
    }


    /*
     * 删除通过where语句查询到的条目
     */
    delete = () => {
        try {
            let result = this[tmp].concat([]);
            this[tmp] = this[store];

            for (let i = 0, l = result.length; i < l; i++ ) {

                (function(i, store){
                    let index = store.indexOf(result[i]);
                    index > -1 && store.splice(index, 1);
                })(i, this[store])
            }

            this._commonOnChange({type: 'delete'})
            return 'delete success';
        } catch(e) {
            console.log(e);
        }
        return this;
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

export default Table;
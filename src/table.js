import {isArray, isObj, isFunction, isString, getType} from './utils';
import Observer from './observer';

/*
 * 使用Symbol增强对属性的保护
 */
const store = Symbol('store');
const tmp = Symbol('tmp');

class Table {
    constructor(opts={}) {
        this.scheme = opts.scheme || false;
        //暂未实现， loose: 不符合要求的行不插入，其他正常插入。 strict: 只要有不符合要求的都不允许插入。
        this.schemeMode = opts.schemeMode || 'loose';
        /*
         * safe：深度clone default
         * unsafe: 不处理,
         * normal: 浅copy
         */
        this.saveMode = opts.saveMode || 'safe';
        this.columns = [];

        this[store] = [];
        this.name = opts.name;
        this.dbOpts = opts.dbOpts || {};
        this.setPrimaryKey = () => {};
        this.checkScheme = () => true;
        if (isObj(this.scheme)) {
            this.checkScheme = (line) => {
                for (var i in this.scheme) {
                    if (this.scheme[i].required && line[i] === undefined) {
                        return false;
                    }
                    if (this.scheme[i].type && line[i] !== undefined){
                        if (getType(line[i]) !== this.scheme[i].type) {
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
            this.primaryKey = primaryKey.name || 'key';
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
        if (isArray(opts.initValue)) {
            this.init(opts.initValue);
        }
        else if (isObj(opts.initValue)) {
            this.insert(opts.initValue);
        }

        this[tmp] = this[store];
    }

    /*
     * 支持链式调用，但不支持多个where链式调用
     */
    where = (query) => {
        this[tmp] = this[store].filter((line, index) => {
            return eval(query);
        });
        return this;
    }

    first = (n) => {
        this[tmp] = this[store].filter((line, index) => {
            return index < n;
        })
        return this;
    }

    last = (n) => {
        this[tmp] = this[store].filter((line, index) => {
            return index > this[store].length - n - 1;
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
     * 返回查找到的数组，如果没有字段名，则返回全部字段，如果有字段名，则返回指定字段
     */
    getValues = (columns) => {
        let result = this[tmp];
        this[tmp] = this[store];

        if (!columns) {
            return JSON.parse(JSON.stringify(result));
        }
        else if (isArray(columns)) {
            return JSON.parse(JSON.stringify(result)); //查指定字段名算法时间复杂度太高，暂不实现
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
     * 初始化表,如果表在创建时指定了scheme，需要对数组字段进行强校验
     */
    init = (arr = []) => {
        var lines = this._beforeSave(arr);
        this[store].length = 0;
        lines.forEach((item) => {
            if (this.checkScheme(item)) {
                this[store].push(item);
            }
        });
        this.register.trigger(this.name); //触发更新广播
        this.dbOpts.onChange('Table ' + this.name + ' init Success', this, 'init', lines);
        return this;
    }

    /*
     * 通用的插入单条方法，仅内部使用, 如果有指定key，则可能进行update操作
     */
    _insert = (line, key) => {
        const data = this[store];
        const filterKey = key || this.primaryKey;
        if (this.checkScheme(line)) {
            this.setPrimaryKey(line);
            if (!isString(filterKey)) {
                data.push(line);
                return true;
            }
            else {
                for (let i; i < data.length; i++) {
                    if (data[i][filterKey] === line[filterKey]) {
                        data[i] = line;
                        return true
                    }
                }
                if (!flag) {
                    data.push(line);
                    return true
                }
            }
        }
    }
    /*
     * 插入一条或多条数据, 如果有key, 则可能进行update操作
     */
    insert = (item, key) => {
        if (isObj(item)) {
            var line = this._beforeSave(item);
            if (!this._insert(line, key)) {
                this.dbOpts.onError('Insert item not match the scheme.', item);
            }
            else {
                this.register.trigger(this.name, {type: 'insert', count: 1, insertCount: 1});
                this.dbOpts.onChange('Table ' + this.name + ' insert Success', this, 'init', item);
            }
        }
        else if (isArray(item)) {
            var lines = this._beforeSave(item);
            var insertCount = 0;
            lines.forEach(line => {
                if (this._insert(line, key)) {
                    insertCount += 1;
                }
            })
            if (insertCount) {
                this.register.trigger(this.name, {type: 'insert', count: item.length, insertCount: insertCount});
            }
            else {
                this.dbOpts.onError('All Insert item not match the scheme.', item);
            }
        }
        else {
            this.dbOpts.onError('Insert item type must be array or object', item);
        }
        return this;
    }


    /*
     * 将where语句查询到的条目进行update, 但只update查到的第一条
     */
    update = (obj) => {
        let result = this[tmp];
        this[tmp] = this[store];

        if (result[0]) {
            Object.keys(obj).forEach(key => result[0][key] = obj[key])
            this.register.trigger(this.name, {type: 'update'});
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

        result.forEach(item => {
            Object.keys(obj).forEach(key => item[key] = obj[key])
        })
        this.register.trigger(this.name, {type: 'update'});
        return 'update success';

    }

    /*
     * 将where语句查询到的全部条目跟传入的数字进行key对比，key值相同的进行update
     */
    updateByKey = (arr, key) => {
        let result = this[tmp];
        this[tmp] = this[store];

        result.map(line => Object.assign(line, arr.find(item => item[key] == line[key])));


        this.register.trigger(this.name, {type: 'update'});
        return [];
    }


    /*
     * 将where语句查询到的全部条目进行update
     */
    replace(arr) {
        this.register.trigger(this.name);
    }


    /*
     * 删除通过where语句查询到的条目
     */
    delete = () => {
        try {
            let result = this[tmp];
            this[tmp] = this[store];
            result.forEach(item => {
                var index = this[store].indexOf(item);
                if (index > -1) {
                    this[store].splice(index, 1);
                }
            });
            this.register.trigger(this.name);
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
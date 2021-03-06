function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

const isArray = v => Object.prototype.toString.call(v) === "[object Array]";

const isObj = v => Object.prototype.toString.call(v) === "[object Object]";

const isFunction = v => Object.prototype.toString.call(v) === "[object Function]";

const isString = v => Object.prototype.toString.call(v) === "[object String]";

const getType = v => {
  var typeStr = Object.prototype.toString.call(v);
  return typeStr.replace('[object ', '').replace(']', '');
};

class Observer {
  constructor() {
    _defineProperty(this, "on", (name, fn) => {
      if (isFunction(fn)) {
        var actionArr = this.actions['on' + name];

        if (isArray(actionArr) && !actionArr.includes(fn)) {
          actionArr.push(fn);
        } else {
          this.actions['on' + name] = [fn];
        }
      }
    });

    _defineProperty(this, "off", (name, fn) => {
      var actionArr = this.actions['on' + name];

      if (actionArr) {
        if (!fn) {
          actionArr = null;
        } else {
          var index = actionArr.indexOf(fn);

          if (index > -1) {
            actionArr.splice(index, 1);
          }
        }
      }
    });

    _defineProperty(this, "trigger", (name, params) => {
      const fnList = this.actions['on' + name];

      if (fnList && fnList.length) {
        for (var i = 0; i < fnList.length; i++) {
          fnList[i](params);
        }
      }
    });

    this.actions = [];
  }

}

/*
 * 使用Symbol增强对属性的保护
 */

const store = Symbol('store');
const tmp = Symbol('tmp');

class Table {
  constructor(opts = {}) {
    _defineProperty(this, "_commonOnChange", message => {
      this.version++;
      this[tmp] = this[store];
      this.register.trigger(this.name, message);
    });

    _defineProperty(this, "where", query => {
      this[tmp] = this[store].filter((line, index) => {
        return eval(query);
      });
      /*
       * 将当前query缓存一下，下次操作被覆盖
       */

      this.currentQuery = query.trim();
      return this;
    });

    _defineProperty(this, "first", n => {
      this[tmp] = this[tmp].filter((line, index) => {
        return index < n;
      });
      return this;
    });

    _defineProperty(this, "last", n => {
      this[tmp] = this[tmp].filter((line, index) => {
        return index > this[store].length - n - 1;
      });
      return this;
    });

    _defineProperty(this, "eq", (k, v) => {
      this[tmp] = this[tmp].filter((line, index) => {
        return line[k] === v;
      });
      return this;
    });

    _defineProperty(this, "in", (k, arr) => {
      this[tmp] = this[tmp].filter((line, index) => {
        return arr.indexOf(line[k]) > -1;
      });
      return this;
    });

    _defineProperty(this, "filter", (k, compare, v) => {
      this[tmp] = this[tmp].filter((line, index) => {
        if (compare === '===') {
          return line[k] === v;
        }

        if (compare === '===') {
          return line[k] === v;
        }

        if (compare === '>=') {
          return line[k] >= v;
        }

        if (compare === '<=') {
          return line[k] <= v;
        }

        if (compare === '>') {
          return line[k] > v;
        }

        if (compare === '<') {
          return line[k] < v;
        }

        if (compare === '!==') {
          return line[k] !== v;
        }

        if (compare === '!=') {
          return line[k] != v;
        }
      });
      return this;
    });

    _defineProperty(this, "orderby", (column = primaryKey) => {
      if (column) {
        this[tmp].sort((a, b) => {
          var columnA = a[column];
          var columnB = b[column];

          if (columnA < columnB) {
            return -1;
          }

          if (columnA > columnB) {
            return 1;
          }

          return 0;
        });
      }
    });

    _defineProperty(this, "getValues", type => {
      let result = this[tmp];
      this[tmp] = this[store];

      if (type === 'safe') {
        return JSON.parse(JSON.stringify(result));
      } else if (!type || type === 'unsafe' || type === 'view') {
        return result;
      }
    });

    _defineProperty(this, "count", () => {
      let result = this[tmp];
      this[tmp] = this[store];
      return result.length;
    });

    _defineProperty(this, "countAll", () => {
      return this[store].length;
    });

    _defineProperty(this, "init", (arr = []) => {
      var lines = this._beforeSave(arr);

      this[store].length = 0;
      lines.forEach(item => {
        if (this.checkschema(item)) {
          this[store].push(item);
        }
      });

      this._commonOnChange(); //触发更新广播


      this.dbOpts.onChange('Table ' + this.name + ' init Success', this, 'init', lines);
      return this;
    });

    _defineProperty(this, "_insert", (line, key) => {
      const data = this[store];
      const filterKey = key || this.primaryKey;

      if (this.checkschema(line)) {
        this.setPrimaryKey(line);

        if (!isString(filterKey)) {
          data.push(line);
          return line[filterKey] || true;
        } else {
          for (let i = 0; i < data.length; i++) {
            if (data[i][filterKey] === line[filterKey]) {
              // data[i] = line;
              Object.keys(line).forEach(key => data[i][key] = line[key]);
              return line[filterKey] || true;
            }
          }

          data.push(line);
          return line[filterKey] || true;
        }
      }
    });

    _defineProperty(this, "insert", (item, key) => {
      const keys = [];

      if (isObj(item)) {
        var line = this._beforeSave(item);

        var kv = this._insert(line, key);

        if (!kv) {
          this.dbOpts.onError('Insert item not match the schema.', item);
        } else {
          this.register.trigger(this.name, {
            type: 'insert',
            count: 1,
            insertCount: 1
          });
          this.dbOpts.onChange('Table ' + this.name + ' insert Success', this, 'init', item);
          keys.push(kv);
        }
      } else if (isArray(item)) {
        var lines = this._beforeSave(item);

        var insertCount = 0;
        lines.forEach(line => {
          var kv = this._insert(line, key);

          if (kv) {
            insertCount += 1;
            keys.push(kv);
          }
        });

        if (insertCount) {
          this._commonOnChange({
            type: 'insert',
            count: item.length,
            insertCount: insertCount
          });
        } else {
          this.dbOpts.onError('All Insert item not match the schema.', item);
        }
      } else {
        this.dbOpts.onError('Insert item type must be array or object', item);
      }

      return keys;
    });

    _defineProperty(this, "update", obj => {
      let result = this[tmp];
      this[tmp] = this[store];

      var obj = this._beforeSave(obj);

      if (result[0]) {
        Object.keys(obj).forEach(key => result[0][key] = obj[key]);

        this._commonOnChange({
          type: 'update'
        });

        return 'update success';
      } else {
        return 'Not Find Update Target.';
      }
    });

    _defineProperty(this, "updateAll", obj => {
      let result = this[tmp];
      this[tmp] = this[store];

      var obj = this._beforeSave(obj);

      result.forEach(item => {
        Object.keys(obj).forEach(key => item[key] = obj[key]);
      });

      this._commonOnChange({
        type: 'update'
      });

      return 'update success';
    });

    _defineProperty(this, "updateByKey", (arr, key) => {
      if (!isArray(arr) || !isString(key)) {
        this.dbOpts.onError('updateByKey first param should be array, second param should be string', [arr, key]);
        return;
      }

      let result = this[tmp];
      this[tmp] = this[store];

      var arr = this._beforeSave(arr);

      result.forEach(line => Object.assign(line, arr.find(item => item[key] == line[key])));

      this._commonOnChange({
        type: 'update'
      });

      return 'updateByKey success';
    });

    _defineProperty(this, "delete", () => {
      try {
        let result = this[tmp].concat([]);
        this[tmp] = this[store];

        for (let i = 0, l = result.length; i < l; i++) {
          (function (i, store) {
            let index = store.indexOf(result[i]);
            index > -1 && store.splice(index, 1);
          })(i, this[store]);
        }

        this._commonOnChange({
          type: 'delete'
        });

        return 'delete success';
      } catch (e) {
        console.log(e);
      }

      return this;
    });

    _defineProperty(this, "bindFn", fn => {
      this.register.on(this.name, fn);
      return this;
    });

    _defineProperty(this, "unbindFn", fn => {
      this.register.off(this.name, fn);
      return this;
    });

    this.schema = opts.schema || false; //暂未实现， loose: 不符合要求的行不插入，其他正常插入。 strict: 只要有不符合要求的都不允许插入。

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
      this.checkschema = line => {
        for (var i in this.schema) {
          if (this.schema[i].required && line[i] === undefined) {
            return false;
          }

          if (this.schema[i].type && line[i] !== undefined) {
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
    } else if (isObj(opts.primaryKey)) {
      this.primaryKey = opts.primaryKey.name || 'key';

      if (opts.primaryKey.autoIncrement) {
        this.setPrimaryKey = (line, value) => {
          let data = this[store];
          let primaryKey = this.primaryKey;

          if (!value) {
            if (data.length) {
              line[primaryKey] = data[data.length - 1][primaryKey] + 1;
            } else {
              line[primaryKey] = 1;
            }
          } else {
            line[primaryKey] = value;
          }
        };
      }
    } //数组或者对象存入数据库之前的处理： safe：深度clone, unsafe: 不处理, normal: 浅copy


    this._beforeSave = obj => {
      if (this.saveMode === 'safe') {
        return JSON.parse(JSON.stringify(obj));
      } else if (this.saveMode === 'unsafe') {
        return obj;
      }

      if (isArray(obj)) {
        return obj.concat([]);
      } else if (isObj(obj)) {
        return Object.assign({}, obj);
      }
    };

    this.register = new Observer();
    /*
     * 数据库发生变化后，queryCache清空
     */

    this.register.on(this.name, () => {
      this.queryCache = {};
    });

    if (isArray(opts.initValue)) {
      this.init(opts.initValue);
    } else if (isObj(opts.initValue)) {
      this.insert(opts.initValue);
    }

    this[tmp] = this[store];
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
    } else {
      this.queryCache[this.currentQuery] = result;
      return this.queryCache[this.currentQuery];
    }
  }
  /*
   * 返回查询后数组长度
   */


}

const tables = Symbol('tables');
const defaultOpts = {
  onError: (err, passData) => console.error(err, passData),
  onMessage: (msg, data) => console.log(msg, data),
  onChange: (msg, table, type, data) => console.log(msg, table, type, data),
  onQuery: (msg, table, query, data) => console.log(msg, table, query, data),
  vueUpdateTimeout: 0
};

class DB {
  constructor(_opts = {}) {
    _defineProperty(this, "dbconnectReact", (...args) => {
      var self = this;
      return target => {
        var _temp;

        return _temp = class Inheritance extends target {
          constructor(props) {
            super(props);

            _defineProperty(this, "componentWillMount", () => {
              super.componentWillMount && super.componentWillMount(); //如果在构造器阶段未绑定成功，在runtime阶段再绑定一次

              !this.binded && this.bindTable();
            });

            _defineProperty(this, "componentWillUnmount", () => {
              super.componentWillUnmount && super.componentWillUnmount();
              this.fnList.forEach(fnMap => {
                fnMap.table.unbindFn(fnMap.fn);
              });
            });

            this.fnList = [];
            this.args = args;

            this.bindTable = () => {
              if (this.args.length) {
                this.args.forEach(tableName => {
                  var fn = () => this.setState({});

                  var table = isString(tableName) ? self.table(tableName) : tableName;

                  if (table) {
                    table.bindFn(fn);
                    this.fnList.push({
                      table: table,
                      fn: fn
                    });
                  }
                });

                if (this.args.length === this.fnList.length) {
                  this.binded = true;
                }
              }
            };

            this.bindTable();
          }

        }, _temp;
      };
    });

    _defineProperty(this, "dbconnectVue", (...args) => {
      var self = this;
      var timeout = self.opts.vueUpdateTimeout;
      return {
        methods: {
          _state_db_update_fn: function () {
            //100ms内触发的update复用同一个$forceUpdate()
            if (timeout) {
              if (!this.updateFlag) {
                this.updateFlag = 1;
                setTimeout(() => {
                  this.$forceUpdate();
                  this.updateFlag = 0;
                }, timeout);
              }
            } else {
              this.$forceUpdate();
            }
          }
        },
        created: function () {
          this.fnList = [];
          this.updateFlag = 0;

          if (args.length) {
            args.forEach(tableName => {
              var table = isString(tableName) ? self.table(tableName) : tableName;

              if (table) {
                table.bindFn(this._state_db_update_fn);
                this.fnList.push({
                  table: table,
                  fn: this._state_db_update_fn
                });
              }
            });
          } else {
            //如果不传参，开启监听所有表
            for (let i in self[tables]) {
              var table = self[tables][i];
              table.bindFn(this._state_db_update_fn);
              this.fnList.push({
                table: table,
                fn: this._state_db_update_fn
              });
            }
          }

          self.bindFn(this._state_db_update_fn);
        },
        beforeDestroy: function () {
          this.fnList.forEach(fnMap => {
            fnMap.table.unbindFn(fnMap.fn);
          });
        }
      };
    });

    _defineProperty(this, "createTable", opts => {
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

      opts.dbOpts = this.opts;
      const table = new Table(opts);
      this[tables][opts.name] = table;
      this.register.trigger('db_event', Object.assign(opts, {
        type: 'create_table'
      }));
      return table;
    });

    _defineProperty(this, "table", name => {
      const table = this[tables][name];

      if (!table) {
        this.opts.onError('Can not find table ' + name);
      } else {
        return table;
      }
    });

    _defineProperty(this, "getTables", () => {
      return this[tables];
    });

    _defineProperty(this, "drop", name => {
      delete this[tables][name];
      this.register.trigger('db_event', {
        tablename: name,
        type: 'drop_table'
      });
    });

    _defineProperty(this, "clear", () => {
      for (let i in this[tables]) {
        delete this[tables][i];
      }

      this.register.trigger('db_event', {
        type: 'clear'
      });
    });

    _defineProperty(this, "transaction", () => {
      /*
       * 事务机制
       */
    });

    _defineProperty(this, "bindFn", fn => {
      this.register.on('db_event', fn);
    });

    _defineProperty(this, "unbindFn", fn => {
      this.register.off('db_event', fn);
    });

    this[tables] = {};
    this.opts = Object.assign(defaultOpts, _opts);
    this.register = new Observer();
  } // 快速关联db和react组件的高阶组件 @db.dbconnectReact(table1, table2, table3)


}

export default DB;
//# sourceMappingURL=bundle.esm.js.map

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
    _defineProperty(this, "where", query => {
      this[tmp] = this[store].filter((line, index) => {
        return eval(query);
      });
      return this;
    });

    _defineProperty(this, "first", n => {
      this[tmp] = this[store].filter((line, index) => {
        return index < n;
      });
      return this;
    });

    _defineProperty(this, "last", n => {
      this[tmp] = this[store].filter((line, index) => {
        return index > this[store].length - n - 1;
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

    _defineProperty(this, "getValues", columns => {
      let result = this[tmp];
      this[tmp] = this[store];

      if (!columns) {
        return JSON.parse(JSON.stringify(result));
      } else if (isArray(columns)) {
        result.forEach(item => {
        });
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
        if (this.checkScheme(item)) {
          this[store].push(item);
        }
      });
      this.register.trigger(this.name); //触发更新广播

      this.dbOpts.onChange('Table ' + this.name + ' init Success', this, 'init', lines);
      return this;
    });

    _defineProperty(this, "_insert", (line, key) => {
      const data = this[store];
      const filterKey = key || this.primaryKey;

      if (this.checkScheme(line)) {
        this.setPrimaryKey(line);

        if (!isString(filterKey)) {
          data.push(line);
          return true;
        } else {
          for (let i; i < data.length; i++) {
            if (data[i][filterKey] === line[filterKey]) {
              data[i] = line;
              return true;
            }
          }

          if (!flag) {
            data.push(line);
            return true;
          }
        }
      }
    });

    _defineProperty(this, "insert", (item, key) => {
      if (isObj(item)) {
        var line = this._beforeSave(item);

        if (!this._insert(line, key)) {
          this.dbOpts.onError('Insert item not match the scheme.', item);
        } else {
          this.register.trigger(this.name, {
            type: 'insert',
            count: 1,
            insertCount: 1
          });
          this.dbOpts.onChange('Table ' + this.name + ' insert Success', this, 'init', item);
        }
      } else if (isArray(item)) {
        var lines = this._beforeSave(item);

        var insertCount = 0;
        lines.forEach(line => {
          if (this._insert(line, key)) {
            insertCount += 1;
          }
        });

        if (insertCount) {
          this.register.trigger(this.name, {
            type: 'insert',
            count: item.length,
            insertCount: insertCount
          });
        } else {
          this.dbOpts.onError('All Insert item not match the scheme.', item);
        }
      } else {
        this.dbOpts.onError('Insert item type must be array or object', item);
      }

      return this;
    });

    _defineProperty(this, "update", obj => {
      let result = this[tmp];
      this[tmp] = this[store];

      if (result[0]) {
        Object.keys(obj).forEach(key => result[0][key] = obj[key]);
        this.register.trigger(this.name, {
          type: 'update'
        });
        return 'update success';
      } else {
        return 'Not Find Update Target.';
      }
    });

    _defineProperty(this, "updateAll", obj => {
      this.register.trigger(this.name);
      return [];
    });

    _defineProperty(this, "updateByKey", (arr, keys) => {
      this.register.trigger(this.name);
      return [];
    });

    _defineProperty(this, "delete", () => {
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

    this.scheme = opts.scheme || false; //暂未实现， loose: 不符合要求的行不插入，其他正常插入。 strict: 只要有不符合要求的都不允许插入。

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
      this.checkScheme = line => {
        for (var i in this.scheme) {
          if (this.scheme[i].required && line[i] === undefined) {
            return false;
          }

          if (this.scheme[i].type && line[i] !== undefined) {
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
    } else if (isObj(opts.primaryKey)) {
      this.primaryKey = primaryKey.name || 'key';

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

    if (isArray(opts.initValue)) {
      this.init(opts.initValue);
    } else if (isObj(opts.initValue)) {
      this.insert(opts.initValue);
    }

    this[tmp] = this[store];
  }
  /*
   * 支持链式调用，但不支持多个where链式调用
   */


  /*
   * 将where语句查询到的全部条目进行update
   */
  replaceByColumn(column = this.primaryKey, values) {
    this.register.trigger(this.name);
  }
  /*
   * 删除通过where语句查询到的条目
   */


}

const tables = Symbol('tables');
const defaultOpts = {
  onError: (err, passData) => console.error(err, passData),
  onMessage: (msg, data) => console.log(msg, data),
  onChange: (msg, table, type, data) => console.log(msg, table, type, data),
  onQuery: (msg, table, query, data) => console.log(msg, table, query, data)
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
      var fnList = [];
      var self = this;
      return {
        methods: {
          _state_db_update_fn: function () {
            this.$forceUpdate();
          }
        },
        created: function () {
          if (args.length) {
            args.forEach(tableName => {
              var table = isString(tableName) ? self.table(tableName) : tableName;

              if (table) {
                table.bindFn(this._state_db_update_fn);
                fnList.push({
                  table: table,
                  fn: this._state_db_update_fn
                });
              }
            });
          }
        },
        beforeDestroy: function () {
          fnList.forEach(fnMap => {
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
        console.log('Can not find table ' + name);
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

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

      if (!fn) {
        actionArr = null;
      } else {
        var index = actionArr.indexOf(fn);

        if (index > -1) {
          actionArr.splice(index, 1);
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
      this[tmp] = this[store].filter(line => {
        return eval(query);
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

    _defineProperty(this, "_insert", line => {
      const data = this[store];
      const primaryKey = this.primaryKey;

      if (this.checkScheme(line)) {
        this.setPrimaryKey(line);

        if (!isString(this.primaryKey)) {
          data.push(line);
          return true;
        } else {
          for (let i; i < data.length; i++) {
            if (data[i][primaryKey] === line[primaryKey]) {
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

    _defineProperty(this, "insert", item => {
      if (!isObj(item)) {
        this.dbOpts.onError('Insert item must be an object.', item);
      }

      var line = this._beforeSave(item);

      if (!this._insert(line)) {
        this.dbOpts.onError('Insert item not match the scheme.', item);
      } else {
        this.register.trigger(this.name);
        this.dbOpts.onChange('Table ' + this.name + ' insert Success', this, 'init', item);
      }

      return this;
    });

    _defineProperty(this, "insertAll", arr => {
      var lines = this._beforeSave(arr);

      lines.forEach(item => {
        this._insert(item);
      });
      this.register.trigger(this.name);
      return this;
    });

    _defineProperty(this, "update", obj => {
      if (this[tmp][0]) {
        Object.keys(obj).forEach(key => this[tmp][0][key] = obj[key]);
        this.register.trigger(this.name);
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
        this[tmp].forEach(item => {
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

            _defineProperty(this, "componentWillUnmount", () => {
              super.componentWillUnmount();
              this.fnList.forEach(fnMap => {
                fnMap.table.unbindFn(fnMap.fn);
              });
            });

            this.fnList = [];
            args.forEach(tableName => {
              var fn = () => this.setState({});

              var table = isString(tableName) ? self.table(tableName) : tableName;
              table.bindFn(fn);
              this.fnList.push({
                table: table,
                fn: fn
              });
            });
          }

        }, _temp;
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
      this[tables][name] = null;
    });

    _defineProperty(this, "clear", () => {
      this[tables] = {};
    });

    this[tables] = {};
    this.opts = Object.assign(defaultOpts, _opts);
  } // 快速管理db和react组件的高阶组件 @db.dbconnectReact(table1, table2, table3)


}

export default DB;
//# sourceMappingURL=bundle.js.map

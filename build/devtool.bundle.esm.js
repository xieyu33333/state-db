var icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAB60lEQVRYR83XPeiPURTA8c8/ZfFOyKhQXjZFUcJMUjZGNoMor5kMDMhg89+UhUGxyICSSQavhcHonVBGOrqPHk+/+/9dPNfPHZ97Oud7Xp9zx4z4jI3YvhzAzQS2fgjgMLlNOIgVSc9DHMO1Rm8O4FsSGBahieTC+JWMA5txNe5qAtzGWlzCYUxK3m/DnXRXFeAzpmIxnqdILMMjvMec2hH4iBlYgmcJIGrhAT5gdm2AW1jXSsHklIKtiOLdUBtgFa5jeqcQIzUbcbc2QOhfiN3Yi+iY0ziLF/+iDduOZ9u1ZhtWBZiLA9iXrJzCSbzMDJ5eIzAzDZKlHWNvsKbV89UicA47M55ewPYBd71GIIZIRGHQieEzqzbAK8zLALzG/NoA57EjAzCOXbUBFqUijE5on6dYjUhD9/RaA6F8AfZjT7J0BscRKRh0egdojPz14vLfTcL2zyO8jAn3y8+jE99eI7ASNzCtY+RT+nff+53iKgVtp+AytqQF4mhSEBts7HBxF4tEcXX/CcAXTMFyPE4Kmh3uLbptFyK9puBd2tPC6JMOwM8lstSzUrl2Cpo1+iKO5NboUsWlcm2AoodEqeJSue4cCIhDqQ5CRzylTjSvmAFFeB9f0wjODMEfn7NPuGFPr4mU9nI3coDv5iyIIca8eRQAAAAASUVORK5CYII=";

var $ = selector => document.querySelector(selector);

var renderHTML = {
  injectPage: methods => {
    // methods.renderTable
    // methods.renderAll
    // methods.renderLine
    // methods.getInfo
    const info = methods.getInfo();
    const tableNames = info.tableNames;
    const tables = info.tables;
    const db = info.db;
    const opts = methods.getOpts();
    const state = {
      query: '',
      tablename: 'all'
    };

    const renderFramework = () => {
      $('#state-db-devtool') && document.body.removeChild($('#state-db-devtool'));
      var devtoolWrapper = document.createElement('div');
      devtoolWrapper.setAttribute('id', 'state-db-devtool');
      devtoolWrapper.className = 'state-db-devtool';
      devtoolWrapper.innerHTML = `
            <style>
                .state-db-devtool {
                    position: fixed;
                    top :10px;
                    right: 10px;
                    height: 30px;
                    width: 30px;
                    z-index: 99999;
                    background: url("${icon}") center;
                    background-size: cover;
                }
                .state-db-devtool-content {
                    position: absolute;
                    top: 30px;
                    right: 0px;
                    background: #fff;
                    padding: 20px;
                    width: 500px;
                    border: 1px solid #c9c9c9;
                    max-height: 650px;
                    overflow: auto;
                }

                .state-db-table-scroll-wrapper {
                    overflow: auto;
                    max-height: 400px;
                    max-width: 460px;
                }
                .state-db-devtool table {
                    font-family: verdana,arial,sans-serif;
                    font-size:11px;
                    color:#333333;
                    border-width: 1px;
                    border-color: #999999;
                    border-collapse: collapse;

                }
                .state-db-devtool table th {
                    background:#b5cfd2;
                    border-width: 1px;
                    padding: 8px;
                    border-style: solid;
                    border-color: #999999;
                }
                .state-db-devtool table td {
                    background:#dcddc0;
                    border-width: 1px;
                    padding: 8px;
                    border-style: solid;
                    border-color: #999999;
                }
            </style>
            <div id="state-db-devtool-content"  class="state-db-devtool-content">
                <select id="state-db-devtool-table-selector">
                    <option value="all">all tables</option>
                    ${tableNames.map(item => `<option value="${item}">${item}</option>`)}
                </select>
                <input id="state-db-devtool-query-input" type="text">
                <button id="state-db-devtool-query-submit" >确认</button>
                <div id="state-db-tables-wrapper"></div>
            </div>`;
      document.body.appendChild(devtoolWrapper);
    };

    const renderData = () => {
      const $tablesWrapper = $('#state-db-tables-wrapper');
      $tablesWrapper.innerHTML = '';

      if (state.tablename === 'all') {
        methods.renderAll();
      } else if (state.tablename !== 'all' && !state.query) {
        methods.renderTable(state.tablename);
      }
    };

    const bindEvent = () => {
      const toggle = el => {
        if (el.style.display === 'none') {
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
      };

      const $toggle = $('#state-db-devtool');
      const $content = $('#state-db-devtool-content');
      const $tableSelector = $('#state-db-devtool-table-selector');
      const $refresh = $('#state-db-devtool-refresh'); //默认不展开

      if (opts.hide) {
        $content.style.display = 'none';
      }

      $toggle.onclick = e => {
        if (e.target === $toggle) {
          toggle($content);
        }
      };

      $tableSelector.onchange = e => {
        // $tablesWrapper.innerHTML = '';
        if (state.tablename !== e.target.value) {
          state.tablename = e.target.value;
          renderData();
        }
      };
    };

    renderFramework();
    renderData();
    bindEvent();
    tables.forEach(table => table.unbindFn(renderData));
    tables.forEach(table => table.bindFn(renderData)); //触发自动变化
  },
  renderArr: (arr, tablename) => {
    var $tablesWrapper = $('#state-db-tables-wrapper');
    var $tableWrapper = document.createElement('div');
    $tableWrapper.className = 'state-db-table-wrapper';

    var getColumns = () => {
      let columns = [];
      arr.forEach(item => {
        columns = columns.concat(Object.keys(item));
      });
      return [...new Set(columns)];
    };

    var renderColumns = () => {
      var str = '';
      getColumns().forEach(key => {
        str = str + '<th>' + key + '</th>';
      });
      return str;
    };

    var renderValues = () => {
      var renderItem = item => {
        var columns = getColumns();
        var strArr = [];

        for (let i = 0; i < columns.length; i++) {
          strArr.push('<td></td>');
        }

        for (let i in item) {
          var index = columns.indexOf(i);

          if (index > -1) {
            strArr[index] = `<td>${item[i]}</td>`;
          }
        }

        return strArr.join('');
      };

      var str = '';
      arr.forEach(item => str += `<tr>${renderItem(item)}</tr>`);
      return str;
    };

    if (arr.length) {
      $tableWrapper.innerHTML = `
            <p>表名：${tablename}，count: ${arr.length}</p>
            <div class="state-db-table-scroll-wrapper">
                <table>
                    <tr>${renderColumns()}</tr>
                    ${renderValues()}
                </table>
            </div>`;
    }

    $tablesWrapper.appendChild($tableWrapper);
  },
  renderItem: line => {
    console.table(line);
  }
};

var renderConsole = {
  injectPage: methods => {
    window.showTable = methods.renderTable;
    window.showTableAll = methods.renderAll;
    window.showTableLine = methods.renderLine;
  },
  renderArr: (arr, tablename) => {
    console.log('******** ' + tablename + ' ********* , item_count: ' + arr.length);
    console.table(arr);
  },
  renderItem: (line, tablename) => console.table(line)
};

const isObj = v => Object.prototype.toString.call(v) === "[object Object]";

/*
 * 接收一个db实例
 */
var index = ((db, render = "console", opts = {}) => {
  let renderer = {};

  if (render == "console") {
    renderer = renderConsole;
  } else if (render == "html") {
    renderer = renderHTML;
  }

  const renderArr = renderer.renderArr;
  const renderItem = renderer.renderItem;

  const renderTable = name => {
    renderArr(db.table(name).getValues(), name);
  };

  const renderAll = () => {
    const tables = db.getTables();

    for (let i in tables) {
      renderTable(i);
    }
  };

  const getInfo = () => {
    const tables = db.getTables();
    const tableNames = [];
    const tableList = [];

    for (let i in tables) {
      tableNames.push(i);
      tableList.push(tables[i]);
    }

    return {
      tables: tableList,
      tableNames: tableNames,
      db: db
    };
  };

  const getOpts = () => {
    if (isObj(opts)) {
      return opts;
    } else {
      return {};
    }
  };

  const renderLine = (tablename, query) => {
    renderArr(db.table(tablename).where(query).getValues(), tablename);
  };

  const exportMethods = {
    renderAll,
    renderTable,
    renderLine,
    getInfo,
    getOpts
  };
  renderer.injectPage(exportMethods);
  db.bindFn(() => {
    console.log('injectPage', db);
    renderer.injectPage(exportMethods);
  });
});

export default index;
//# sourceMappingURL=devtool.bundle.esm.js.map

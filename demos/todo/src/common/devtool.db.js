/*
 * 接收一个db实例
 */
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

var renderHTML = () => {// injectPage: (methods) => {
  //     // methods.renderTable
  //     // methods.renderAll
  //     // methods.renderLine
  //     // var devtoolWrapper = document.createElement('div');
  //     // devtoolWrapper.innerHTML = `<div>
  //     //     <select id="">
  //     //     </select id="">
  //     //     <input id="">
  //     // </div>`
  //     // document.body.appendChild(devtoolWrapper);
  // },
  // renderArr: (arr) => console.table(arr),
  // renderItem: (line) => console.table(line),
};

var index = ((db, render = "console", namespace) => {
  let renderer = {};

  if (render == "console") {
    renderer = renderConsole;
  } else if (render == "html") {
    renderer = renderHTML;
  }

  const tables = db.getTables();
  const renderArr = renderer.renderArr;
  const renderItem = renderer.renderItem;

  const renderTable = name => {
    renderArr(db.table(name).getValues(), name);
  };

  const renderAll = () => {
    console.log(tables);

    for (let i in tables) {
      renderTable(i);
    }
  };

  const renderLine = (tablename, query) => {
    renderArr(db.table(tablename).where(query).getValues(), tablename);
  };

  const exportMethods = {
    renderAll,
    renderTable,
    renderLine
  };
  renderer.injectPage(exportMethods, namespace);
});

export default index;
//# sourceMappingURL=devtool.bundle.js.map

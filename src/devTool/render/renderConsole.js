var renderConsole = {
    injectPage: (methods) => {
        window.showTable = methods.renderTable
        window.showTableAll = methods.renderAll
        window.showTableLine = methods.renderLine
    },
    renderArr: (arr, tablename) => {
        console.log('******** ' + tablename + ' ********* , item_count: ' + arr.length);
        console.table(arr);
    },
    renderItem: (line, tablename) => console.table(line)
}

export default renderConsole;
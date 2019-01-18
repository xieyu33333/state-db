/*
 * 接收一个db实例
 */
import renderHTML from './render/renderHTML.js';
import renderConsole from './render/renderConsole.js';

export default (db, render="console") => {
    let renderer = {};
    if (render=="console") {
        renderer = renderConsole;
    }
    else if (render=="html") {
        renderer = renderHTML;
    }

    const renderArr = renderer.renderArr;

    const renderItem = renderer.renderItem;

    const renderTable = (name) => {
        renderArr(db.table(name).getValues(), name);
    }

    const renderAll = () => {
        const tables = db.getTables()
        for (let i in tables) {
            renderTable(i);
        }
    }

    const getInfo = () => {
        const tables = db.getTables()
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
        }
    }

    const renderLine = (tablename, query) => {
        renderArr(db.table(tablename).where(query).getValues(), tablename);
    }


    const exportMethods = {
        renderAll,
        renderTable,
        renderLine,
        getInfo
    }

    renderer.injectPage(exportMethods);
    db.bindFn(() => {
        console.log('injectPage', db);
        renderer.injectPage(exportMethods);
    })
}


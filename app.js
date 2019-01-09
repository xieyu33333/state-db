const db = new DB();

db.createTable('state', false, {key: 'content', value: '测试一下啦啦啦啦啦'});
db.createTable('list', false);

const model = {};
//组件不允许直接定义update/insert等方法
model.changeContent = () => db.table('state').where('line.key == \"content\"').update({value: Math.random()})
model.getContent = () => db.table('state').where('line.key == \"content\"').getValues()


//组件自己的方法只进行对model方法的修饰
const render = () => {
    console.log('render');
    const getContent = () => {
        return model.getContent()[0].value
    }

    const tpl = `<div>
        <p>${ getContent() }</p>
        <button onclick="model.changeContent()">修改content</button>
        <button onclick="model.setList()">远程拉取list</button>
    </div>`

    document.getElementById('app').innerHTML = tpl;
}

//db的更新通知到注册中心，注册中心找到与更新数据相关的组件，执行组件渲染方法

db.table('state').bindFn(render);

render();

#### Version 0.2.0

- [ x ]table增加运行时version属性，在vue项目里可以由项目自身根据version进行结果缓存。
- 增加eq方法,可以进行and链式调用
```js
var arr = test1Table.eq('age', 10).getValues();
//等效于
var arr = test1Table.filter('age', '===', 10).getValues();
```
- 增加filter方法,可以进行and链式调用
```js
var arr = test1Table.filter('age', '>=', 10).getValues();


```
- [ x ]增加in方法,可以传入数组批量查询
```js
var arr = test1Table.in('name', ['test1', 'test3']).getValues();
```
- [ x ]对于全局vue项目，200ms内不会重复触发$forceUpdate, timeout值可以在db初始化时进行配置。
```js
var db = new DB({
    vueUpdateTimeout: 1000
})
```




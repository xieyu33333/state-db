## React 单项目种子工程指南

#### why & 目标

-   快速启动项目
-   内置 react 全家桶及 Demo
-   内置构建工具优化
    -   babel
    -   webpack
    -   webpack-pugin
-   当前的最佳实践
-   内置规范工具

    -   代码规范工具

        -   Prettier
        -   fecs
        -   lint-staged

    -   git 提交规范插件
        -   commitizen

-   文档链接
    -   代码规范文档
    -   react-demo 地址
    -   react 规范文档

#### 基础目录结构

---- builder webpack 相关 配置文件
---- dist 打包后的产出
---- docs 文档
---- src 源代码

#### 全局安装准备工作

1、编辑器上安装 Prettier 插件

-   [VSCode]()
-   [Sublime]()
-   [WebStorm]()

2、全局安装 commitizen

```sh
npm install -g commitizen
npm install -g conventional-changelog
npm install -g conventional-changelog-cli
```

#### 使用指南

在开发模式下进行开发

```sh
npm start
npm start 8888  #指定端口号
```

创建一个名为 xxx 的组件目录, 快速创建业务模块（未实现）

```sh
npm run create xxx
```

打包到 RD/QA/ONLine 模式

```sh
npm run rd/qa/online
```

commit 提交

```sh
npm run commit
```

发布测试版本(未实现)

```sh
npm run release
```

发布上线版本并合并到 master（未实现）

```sh
npm run publish
```

#### 相关参考资料

-   [react-feature-demo](http://gitlab.zhidaoauto.com/xieyu/react-feature-demo)
-   [JavaScript 规范](http://wiki.zhidaohulian.com/pages/viewpage.action?pageId=12125152)
-   [前端 Git 分支开发规范](http://wiki.zhidaohulian.com/pages/viewpage.action?pageId=12125213)
-   [React 开发规范](http://wiki.zhidaohulian.com/pages/viewpage.action?pageId=12125208)

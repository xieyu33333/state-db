@startuml

title 基本用法时序图

== 状态初始化 ==

remoteServer -> stateDb: 状态初始化
stateDb -> View: 视图初始化

== 本地状态变化 ==

View -> stateDb: 存储本地状态
stateDb -> View: 自动触发视图变化

== 状态变化持久化 ==

View -> remoteServer: 提交用户操作
remoteServer -> stateDb: 远程状态同步至本地
stateDb -> View: 视图更新

@enduml
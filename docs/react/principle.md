### 第一章 Fiber 架构的含义

`Fiber`包含三层含义：

1. 作为架构来说，之前`React15`的`Reconciler`采用递归的方式执行，数据保存在递归调用栈中，故称为`stack Reconciler`。`React16`的`Reconciler`基于`Fiber节点`实现，被称为`Fiber Reconciler`。
2. 作为静态的数据结构来说，每个`Fiber节点`对应一个`React element`，保存了该组件的类型（函数组件/类组件/原生组件...）、对应的 DOM 节点等信息。
3. 作为动态的工作单元来说，每个`Fiber节点`保存了本次更新中该组件改变的状态、要执行的工作（需要被删除/被插入页面中/被更新...）。

**Fiber 的结构**

你可以从这里看到[Fiber 节点的属性定义](https://github.com/facebook/react/blob/1fb18e22ae66fdb1dc127347e169e73948778e5a/packages/react-reconciler/src/ReactFiber.new.js#L117)。虽然属性很多，但我们可以按三层含义将他们分类来看

```js
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode
) {
  // 基础属性，用于描述本节点基本信息。
  this.tag = tag;
  this.elementType = null;
  this.stateNode = null;
  this.props = null;
  this.ref = null;
  this.type = null; // 表示节点的类型，可以是 DOM 元素、组件函数、Class 组件、文本节点等。
  this.key = key; // 用于优化节点的更新性能，通常是在列表渲染时使用。

  // 链接属性，用于连接其他Fiber节点形成Fiber树
  this.return = null; // 指向该节点的父节点。
  this.child = null; // 指向该节点的第一个子节点。
  this.sibling = null; // 指向该节点的下一个兄弟节点。
  this.index = 0; // 在兄弟节点中的位置索引。

  // 更新属性，用于描述组件的更新信息
  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;
  this.alternate = null; // 指向该fiber在另一次更新时对应的fiber

  // 模式属性，用于描述组件的渲染模式
  this.mode = mode;

  // 副作用属性，用于描述组件的副作用信息
  this.effectTag = NoEffect;
  this.nextEffect = null;
  this.firstEffect = null;
  this.lastEffect = null;

  // 有限产属性，用于实现优先级调度
  this.lanes = NoLanes;
  this.childLanes = NoLanes;
}
```

## **作为静态的工作单元**

作为一种静态的工作单元，保存了当前节点的基础信息：如节点类型、节点 key 值、节点对应的真实 DOM 属性

```js
// Fiber对应组件的类型 Function/Class/Host...
this.tag = tag;
// key属性
this.key = key;
// 大部分情况同type，某些情况不同，比如FunctionComponent使用React.memo包裹
this.elementType = null;
// 对于 FunctionComponent，指函数本身，对于ClassComponent，指class，对于HostComponent，指DOM节点tagName
this.type = null;
// Fiber对应的真实DOM节点
this.stateNode = null;
```

## **作为动态的工作单元**

作为动态的工作单元，保存了当前节点本次更新相关的信息：如`effect`相关信息

```js
// 保存本次更新造成的状态改变相关信息
this.pendingProps = pendingProps;
this.memoizedProps = null;
this.updateQueue = null;
this.memoizedState = null;
this.dependencies = null;

this.mode = mode;

// 保存本次更新会造成的DOM操作
this.effectTag = NoEffect;
this.nextEffect = null;

this.firstEffect = null;
this.lastEffect = null;
```

如下两个字段保存调度优先级相关的信息，会在讲解`Scheduler`时介绍。

```js
// 调度优先级相关
this.lanes = NoLanes;
this.childLanes = NoLanes;
```

## **作为架构单元来说**

每个 Fiber 节点有个对应的`React element`，多个`Fiber节点`是如何连接形成树呢？靠如下三个属性：

```js
// 指向父级Fiber节点
this.return = null;
// 指向子Fiber节点
this.child = null;
// 指向右边第一个兄弟Fiber节点
this.sibling = null;
```

> 为什么父级指针叫做`return`而不是`parent`或者`father`呢？
>
> 因为作为一个工作单元，`return`指节点执行完`completeWork`（本章后面会介绍）后会返回的下一个节点。子`Fiber节点`及其兄弟节点完成工作后会返回其父级节点，所以用`return`指代父级节点。

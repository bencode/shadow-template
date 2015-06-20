shadow-template
====

shadow-template是一个支持组件化的javascript模板引擎，它可以让开发者使用自定义标签的方式来重用组件。


## 特性

shadow-template的语法借鉴一个非常快速和简洁的模板引擎 [artTemplate](https://github.com/aui/artTemplate)。它只有几个必要的语句，学习成本非常低，运行效率却非常高，而且编译好的模板很方便调试。它支持在nodejs环境和浏览器环境下工作。



## 基本使用


模板指令包含在`{{ }}`内


### 输出

```html
{{name}}
```

默认情况下，会对结果进行html转义输出，如果需要原样输出，需要在前面加个等号：


```html
{{=name}}
```

关于输出有以下规则

1. 基本类型将会直接输出  
2. 如果是对象类型，则调用其toString()方法输出 
3. 如果是function，则会先执行function，然后输出返回结果  
4. 如果是对象类型，且包含toHTML()方法，则调用toHTML() 且不转义输出


### 判断

```html
{{if offers.length === 0}}
  <div>empty</div>
{{/if}}
```

可以有`else`或`else if`

```html
{{if offers.length > 0}}
  <ul class="offers">
    ...
  </ul>
{{else}}
  <div class="no-results">no results</div>
{{/if}}
```

**说明: if 语句后面的判断可以是任何有效的js表达式，非常灵活**


### 循环

```html
{{each offers as offer}}
  <li>
    {{offer.name}}
  </li>
{{/each}}
```

可以在模板中使用当前的循环序号

```html
{{each offers as offer index}}
  <li>{{index}}. {{offer.name}}</li>
{{/each}}
```

可以对对象类型进行迭代

```html
{{each props as value name}}
  <dt>{{name}}{{name}}
  <dd>{{value}}</dd>
{{/each}}
```

### 表达式

模板中不应该有业务逻辑，但有时候为了简化对象的引用需要使用一些赋值语句

```html
{{! props = model.offer.props }}

{{ props.name }}
{{ props.age }}
...
```

表达式可以跨越多行

```html
{{!
var name = model.offer.name
var price = model.offer.price
}}
```


熟悉了以上语法就可以编写模板代码了，但shadow的特点是允许以自定义标签的方式定义和使用组件，下面文档描述了如何定义和使用组件。


### 注释

```html
{{// 这里是注释 }}

{{/*
这里是注释，支持多行哦
这里是注释，支持多行哦
}}
```

## 组件

带中划线的标签或首字母为大写的标签都会被引擎识别为组件

```html
<x-panel>
  <heading>{{title}}</heading>
  <body>{{desc}}</body>
</x-panel>
```

或

```html
<Button text="confirm" />
```


### 组件的定义

在nodejs中可以将组件定义在单独的文件中，如button.tpl，然后使用API加载到渲染上下文中。
在浏览器环境中，可以定义在`<script>`标标签中，引擎会自动加载的。

可以这样定义bootstrap中的button

```html
<!-- in button.html -->
<button class="button button-{{type}}">{{$children}}</button>
```

或者
```
<script type="text/shadow" name="x-button">
  <button class="button button-{{type}}">{{$children}}</button>
</script>
```

也可以在一个统一片断中由`<shadow-element>`统一定义，这比较适合浏览器端公共库的定义。

```
<shadow-element name="x-button">
  <button class="button button-{{type}}">{{$children}}</button>
</shadow-element>


<shadow-element name="x-tabs">
  <div ... />
</shadow-element>
```

浏览器端使用时，可以加载编译好的js代码进行使用。

组件中可以使用调用组件的属性以及上下文中的变量，可以类比于函数调用的参数和closure上下文中的变量。

可以通过`$children`变量访问子节点，可以通过`$children.length`来判断是否有子节点

可以使用`{{$children}}`输出所有children的内容，如果要传递参数，可以使用`{{$children({items: items})}}`

上述按扭组件可以这样使用：


```html
<x-button type="default">confirm</x-button>
```

以上调用会输出：

```html 
<button class="button button-default">confirm</button>
```

下面是一个定义bootstrap panel的例子

```html
<div class="panel {{type}}">
  {{if $children.heading || $children.title}}
  <div class="panel-heading">
    {{$children.heading}}
    {{if $children.title}}
    <div class="panel-title">{{$children.title}}</div>
    {{/if}}
  </div>
  {{/if}}

  {{if $children.body}}
  <div class="panel-body">
    {{$children.body}}
  </div>
  {{/if}}

  {{if $children.footer}}
  <div class="panel-footer">
    {{$children.footer}}
  </div>
  {{/if}}
</div>
```

使用`{{if $children.title}}`来判断是否有title节点，使用`{{$children.title}}`来输出title节点，如果需要传递参数，则使用函数调用语句`{{$children.title({ item: item })}}`


### 组件的使用

可以这样使用上述定义的panel

```html
<x-panel type="primary">
  <title>Panel Title</title>
  <body>Panel Content</body>
</x-panel>
```

上述会输出

```html
<div class="panel primary">
  <div class="panel-heading">
    <div class="panel-title">Panel Title</div>
  </div>
  <div class="panel-body">
    Panel Content
  </div>
</div>
```

### 变量作用域


假设有`list`组件如下

```html
<ul>
  {{each items as item}}
    <li>{{ $children({ item: item }) }}</li>
  {{/each}}
</ul>
```

使用时

```html
<div>
  <x-list items={{offers}}>
    <x-panel>
      <title>{{item.title}}</title>
      <body>
        <dl>
          <dt>price</dt>
          <dd>{{item.price}}</dd>
        </dl>
      </body>
    </x-panel>
  </x-list>
</div>
```

上述x-panel中的`item`对象使用的是组件中传递的`item`参数，如果外围变量中也有`item`变量，外围变量将会被隐藏。

这类似于函数参数变量和closure上下文中相同名称的变量，如果需要使用，则在组件调用前先保存成其他名称。

```html
<div>
  {{! thisitem = item }}
  <x-list items="{{offers}}">
    <title>{{item.title}}</title>
    <body>
      {{thisitem.title}}
    </body>
  </x-list>
</div>
```

## 使用

### nodejs

```
npm install shadow-template
```

```js
var shadow = require('shadow-template');

// 加载组件
// 一般来说会遍历整个目录进行加载
shadow.element('x-tab', template)
shadow.element('x-panel', template);
...

// 编译和渲染
var render = shadow.compile(tpl);
var html = render(context);
...
```

### 浏览器

首先需要在页面中引入shadow-template

```html
<script src="/path-to-shadow-template-lib/dist/shadow-template.min.js"></script>
```

可以在页面中直接定义组件

```html
<script type="text/shadow" name="x-tab">
  ...
</script>

<script type="text/shadow" name="x-panel">
  ...
</script>
```

当然也可以直接引入编译好的组件

```html
<script src="/page-to-your-element"></script>
```

然后在js中就可以使用了

```html
<script type="text/javascript">

var render = shadowTemplate.compile(tpl);
var html = render(context);

document.getElementById('container').innerHTML = html;

</script>
```

也可以像nodejs使用一样通过api定义组件

```js
var tpl = '<div ...>';
shadow.element('x-list', tpl);
```

## 定义指令

shadow-template可以扩展指令，本身内置的几个指令也是这样扩展上去的。

扩展指令时会直接介入到编译流程。


```js
shadow.directive('if', function(conditional, options) {
    if (conditional) {
        return options.fn();
    } else {
        return options.inverse();
    }

    // options.hash   指令hash，比如{{each items as item index}}
    // hash -> { item: undefined, index: undefined }

    // options.data  上下文数据
});
```

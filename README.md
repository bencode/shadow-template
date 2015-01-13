shadow
====

shadow是一个支持组件化的nodejs模板引擎，它可以让开发者使用自定义标签的方式来重用组件。


## 特性

shadow的语法借鉴一个非常快速和简洁的模板引擎 [artTemplate](https://github.com/aui/artTemplate)。它只有几个必要的语句，学习成本非常低，运行效率却非常高，而且编译好的模板很方便调试。


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
3. 如果是function，则会先执行function，然后输出运行结果  
4. 如果是对象类型，且包含属性safeString = true，则不转义输出


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

### 语句

模板中不应该有业务逻辑，但有时候为了简化对象的引用需要使用一些赋值语句

```html
{{! props = model.offer.props }}

{{ props.name }}
{{ props.age }}
...
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


可以这样定义bootstrap中的button

```html
<button class="button button-{{type}}">{{children}}</button>
```

组件中可以使用调用组件的属性以及上下文中的变量，可以类比于函数调用的参数和closure上下文中的变量。

可以通过`children`变量访问子节点，可以通过`children.length`来判断是否有子节点

可以使用`{{children}}`输出所有children的内容，如果要传递参数，可以使用`{{children.toString({...})}}`

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
  {{if children.heading || children.title}}
  <div class="panel-heading">
    {{children.heading}}
    {{if children.title}}
    <div class="panel-title">{{children.title}}</div>
    {{/if}}
  </div>
  {{/if}}

  {{if children.body}}
  <div class="panel-body">
    {{children.body}}
  </div>
  {{/if}}

  {{if children.footer}}
  <div class="panel-footer">
    {{children.footer}}
  </div>
  {{/if}}
</div>
```

使用`{{if children.title}}`来判断是否有title节点，使用`{{children.title}}`来输出title节点，如果需要传递参数，则使用函数调用语句`{{children.title({ item: item })}}`


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
    <li>{{ children.toString({ item: item }) }}</li>
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


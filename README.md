# jquery-kealselect
-------
kealselect 是依赖jquery的select插件，包括单选（single）、多选（multi），以及后续会更新的树形（tree）等更多select组件。
### Name From
Dota英雄召唤师（keal），kealselect实质上是一个select实例管理器，通过kealselect暴露的方法来控制或创建多种select，就像召唤师keal一样，控制冰火雷三种元素，组成很多种法术。（作者很中二......0.0）
### Download
 - `git clone https://github.com/BigFly2333/jquery-kealselect.git`
 - download zip
### Getting Start

#### 1.create a select
在页面上创建一个或多个select元素，其中`id`属性是必须的

    //html
    <select class="kealselect" id="ks">
    	<option value="o1">Option 1</option>
    	<option value="o2">Option 2</option>
    	<option value="o3">Option 3</option>
    	<option value="o4">Option 4</option>
        <option value="o5">Option 5</option>
    </select>

#### 2.new KealSelect(options)
kealselect是直接挂载在window对象上的构造函数，可以需要new一个kealselect实例对象：

    //javascript
    var options = {
        el: '.kealselect'
    };
    var kealselect = new Kealselect(options);
       
在这个kealselect实例中可能会管理着一个或多个select实例，kealselect实例中的实例对象的数量由`el`所对应到的select元素数量决定。

#### 3.options
 - `el <string>` - selector of select，符合jquery规则的选择器都可以
 - `maxwidth <string|int>` - 最后渲染出来的select控件的最大宽度，默认`300`
 - `minWidth <string|int>` - 最后渲染出来的select控件的最小宽度，默认`200`
 - `btnClasses <string>` - 添加自定义select选择按钮的class
 - `menuClasses <string>` - 添加自定义select option下拉容器的class
 - `text <object>` - 控件文本自定义替换
    - `noneSelected <string>` - 未选择时控件显示文本，默认`'Select options'`
    - `cbAll <string>` - 多选时，选择所有按钮文本，默认`'all'`
    - `clear <string>` - 多选时，清除所有按钮文本，默认`'clear'`
    - `benSure <string>` - 多选时，确定按钮文本，默认`'sure'`
    - `btnCancel <string>` - 多选时，取消按钮文本，默认`'cancel'`
 - `selectedCb <function>` - 选择成功后回调（多选时，点击确定按钮后才会回调），返回参数
     - `id <string>` - select元素的id（也是select实例的id）
     - `selected <object>` - 选择成功的值
         - `val <string>` - 数据值，多选时类型为`Array`
         - `text <string>` - 显示值，多选时类型为`Array`
 
#### 4.kealselect.fn()
 - `getVal(selector)` - 获取相应的select实例选择的值
    - `selector <string>` - 可选参数，不传时默认为所有kealselect中的select实例（下同），符合jquery规则的选择器（下同）
    - `返回 <object>` - `key <string>` : select实例id；`value <object>` : select实例的selected值。
 - `setOptions(selector, o)` - 设置select实例的options，会覆盖初始new实例时所传进去的options
     - `selector <string>` - 可选参数
     - `o <object>` - 重新设置的options值
 - `setVal(selector, val, reload)` - 设置select值
     - `selector <string>` - 必填参数
     - `val <string|array>` - 当为多选时可以传入一个`array`
     - `reload <boolean>` - 可选参数，不传时默认为`true`，是否需要重置select控件（相对于多选select），如果传入`false`则会保留当前已选则的选项，反之则不会
 - `clear(selector, callback)` - 清空select控件
     - `selector <string>` - 可选参数
     - `callback <function>` - 可选参数，清空之后的回调，如果不传默认执行options中传入的`selectedCb`方法。**当清空的select控件为多个时，建议传入`callback`，否则会出现`selectedCb`多次执行的问题。**
 - `reload()`
......持续更新

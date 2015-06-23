module.exports = Template;


/**
 * 构造一个Template实例用于编译和渲染模板
 * 每个Template可以有独立的一组helper
 *
 * @param {Object} options
 */
function Template(options) {
    this.options = options;
}


var proto = Template.prototype;


/**
 * 编译一个模板
 *
 * @param {String} name   可选的名称
 * @param {String} tpl    模板内容
 * @return {Function(context)}  渲染方法
 */
proto.compile = function(name, tpl) {
    
};


/**
 * 注册一个helper
 *
 * @param {String} name  名称
 * @param {Function(param1, param2, ... options)}  方法
 */
proto.registerHelper = function(name, factory) {
    
};

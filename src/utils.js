const isArray = (v) => Object.prototype.toString.call(v) === "[object Array]"
const isObj = (v) => Object.prototype.toString.call(v) === "[object Object]"
const isFunction = (v) => Object.prototype.toString.call(v) === "[object Function]"
const isString = (v) => Object.prototype.toString.call(v) === "[object String]"
const isNumber = (v) => Object.prototype.toString.call(v) === "[object Number]"

const getType = (v) => {
    var typeStr = Object.prototype.toString.call(v);
    return typeStr.replace('[object ', '').replace(']', '');
}
const errorHanle = (type, e) => {

}

export {isArray, isObj, isFunction, isString, isNumber, getType, errorHanle}


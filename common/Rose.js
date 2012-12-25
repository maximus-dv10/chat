var Rose = {};

Rose.callIf = function (obj, func, context,args){
    if(_.has(obj, func) && _.isFunction(obj[func])){
        return obj[func].apply(context , args);
    }
    return true;
}

Rose.extend = function(Child, Parent, ChildProto) {
    var F = function() { }
    F.prototype = Parent.prototype
    Child.prototype = new F()
    Child.prototype.constructor = Child
    Child.superclass = Parent.prototype
        
    if(ChildProto){
        _.extend(Child.prototype, ChildProto);
    }
};

Array.prototype.each = function (callback, context){
    context = context || this;
    
    for(var i in this){
        if(typeof(this[i])!='function')
            if(callback.call(context, this[i], i ) === false)break;
    }
}
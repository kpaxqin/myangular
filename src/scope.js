/**
 * Created by kpaxqin@github on 15-3-15.
 */
/* jshint globalstrict: true */
'use strict';

function Scope(){
    this.$$watchers = [];
    this.$$lastDirtyWatch = null;

    this.$$asyncQueue = [];

    this.$$applyAsyncQueue = [];
    this.$$applyAsyncId = null;
}

function initWatchVal(){}

Scope.prototype.$watch = function(watcherFn, listenerFn, valueEq){
    var watcher = {
        watcherFn: watcherFn,
        listenerFn: listenerFn || function(){},
        valueEq: !!valueEq,
        last: initWatchVal
    };

    this.$$watchers.push(watcher);
    this.$$lastDirtyWatch = null;
};
Scope.prototype.$$digestOnce = function(){
    var self = this;
    var newValue, oldValue, listenerFn, dirty, valueEq;
    _.forEach(this.$$watchers, function(watcher){
        newValue = watcher.watcherFn(self);
        oldValue = watcher.last;
        listenerFn = watcher.listenerFn;
        valueEq = watcher.valueEq;

        if (!self.$$areEqual(newValue, oldValue, valueEq)){
            self.$$lastDirtyWatch = watcher;

            //若为深对比，则last也应该为当前值的克隆而非引用
            watcher.last = valueEq ? _.cloneDeep(newValue) : newValue;

            listenerFn(newValue,
                (oldValue === initWatchVal) ? newValue: oldValue,
                self);

            dirty = true;
        }else if (watcher === self.$$lastDirtyWatch){
            return false;
        }
    });
    return dirty;
};
Scope.prototype.$digest = function(){
    var dirty,
        ttl = 10;//脏检测上限次数

    this.$$beginPhase("$digest");

    //每次digest都清空lastDirty
    this.$$lastDirtyWatch = null;

    if(this.$$applyAsyncId){
        clearTimeout(this.$$applyAsyncId);
        this.$$flushApplyAsync();
    }
    do{
        while(this.$$asyncQueue.length){
            var asyncTask = this.$$asyncQueue.shift();
            asyncTask.scope.$eval(asyncTask.expression);
        }

        dirty = this.$$digestOnce();

        //到达脏检测次数限制，放弃本次脏检测并抛出异常
        if ((dirty || this.$$asyncQueue.length) && !(ttl--)){
            this.$$clearPhase();
            throw new Error("10 digest reached");
        }
    }while(dirty || this.$$asyncQueue.length);

    this.$$clearPhase();
};
Scope.prototype.$eval = function(expr, arg){
    return expr(this, arg);
};

Scope.prototype.$apply = function(expr){
    try{
        this.$$beginPhase("$apply");
        return this.$eval(expr);
    }finally{
        this.$$clearPhase();
        this.$digest();
    }
};

Scope.prototype.$evalAsync = function(expr){
    var self = this;
    if (!this.$$phase && !this.$$asyncQueue.length){
        setTimeout(function(){
            if (self.$$asyncQueue.length){
                self.$digest();
            }
        }, 0);
    }

    this.$$asyncQueue.push({
        scope: this,//related to scope inheritance
        expression: expr
    });
};

Scope.prototype.$applyAsync = function(expr){
    var self = this;

    this.$$applyAsyncQueue.push(function(){
        self.$eval(expr);
    });

    if (!this.$$applyAsyncId){
        this.$$applyAsyncId = setTimeout(function(){
            self.$apply(function(){
                self.$$flushApplyAsync();
            });

        }, 0);
    }

};

Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq){
    if (valueEq){
        return _.isEqual(newValue, oldValue);
    } else{
        //判定NaN
        var isBothNaN = (typeof newValue === "number" &&
            typeof oldValue === "number" &&
            isNaN(newValue) &&
            isNaN(oldValue)
            );

        return newValue === oldValue || isBothNaN;
    }

};

Scope.prototype.$$beginPhase = function(phase){
    if (this.$$phase){
        throw this.$$phase + " already in progress";
    }

    this.$$phase = phase;
};
Scope.prototype.$$clearPhase = function(){
    this.$$phase = null;
};

Scope.prototype.$$flushApplyAsync = function(){
    while (this.$$applyAsyncQueue.length){
        this.$$applyAsyncQueue.shift()();
    }
    this.$$applyAsyncId = null;
}

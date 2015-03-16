/**
 * Created by kpaxqin@github on 15-3-15.
 */
/* jshint globalstrict: true */
'use strict';

function Scope(){
    this.$$watchers = [];
}

function initWatchVal(){}

Scope.prototype.$watch = function(watcherFn, listenerFn){
    var watcher = {
        watcherFn: watcherFn,
        listenerFn: listenerFn || function(){},
        last: initWatchVal
    };

    this.$$watchers.push(watcher);
};
Scope.prototype.$$digestOnce = function(){
    var self = this;
    var newValue, oldValue, listenerFn, dirty;
    _.forEach(this.$$watchers, function(watcher){
        newValue = watcher.watcherFn(self);
        oldValue = watcher.last;
        listenerFn = watcher.listenerFn;

        if (oldValue !== newValue){
            watcher.last = newValue;

            listenerFn(newValue,
                (oldValue === initWatchVal) ? newValue: oldValue,
                self);

            dirty = true;
        }
    });
    return dirty;
};
Scope.prototype.$digest = function(){
    var dirty, counter = 10;
    do{
        dirty = this.$$digestOnce();

        if (dirty && !(counter--)){
            throw "10 digest reached";
        }
    }while(dirty);
};

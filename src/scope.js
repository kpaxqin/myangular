/**
 * Created by kpaxqin@github on 15-3-15.
 */
/* jshint globalstrict: true */
'use strict';

function Scope(){
    this.$$watchers = [];
}

function initWatchVal(){}

Scope.prototype.$$watch = function(watcherFn, listenerFn){
    var watcher = {
        watcherFn: watcherFn,
        listenerFn: listenerFn,
        last: initWatchVal
    };

    this.$$watchers.push(watcher);
};
Scope.prototype.$$digest = function(){
    var self = this;
    var newValue, oldValue;
    _.forEach(this.$$watchers, function(watcher){
        newValue = watcher.watcherFn(self);
        oldValue = watcher.last;

        if (oldValue !== newValue){
            watcher.last = newValue;
            watcher.listenerFn(newValue,
                (oldValue === initWatchVal) ? newValue: oldValue,
                self);
        }
    });
};
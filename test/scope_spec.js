/**
 * Created by kpaxqin@github on 15-3-15.
 */
/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

describe("Scope", function(){
    it("constructed and used as an object", function(){
        var scope = new Scope();

        scope.aProp = 1;

        expect(scope.aProp).toBe(1);
    });

    describe("digest", function(){
       var scope;

        beforeEach(function(){
            scope = new Scope();
        });

        it("calls the listener function of a watch on first $digest", function(){
            var watchFn = function(){
                return "wat";
            };
            var listenerFn = jasmine.createSpy();

            scope.$watch(watchFn, listenerFn);

            scope.$digest();

            expect(listenerFn).toHaveBeenCalled();

        });
        it("calls the watcher with the scope as the argument", function(){
            var watchFn = jasmine.createSpy();
            var listenerFn = function(){};

            scope.$watch(watchFn, listenerFn);

            scope.$digest();

            expect(watchFn).toHaveBeenCalledWith(scope);
        });
        it("calls the listener function when the watched value changes", function(){
            scope.foo = "a";
            scope.counter = 0;

            scope.$watch(function(scope){
                return scope.foo;
            }, function(newValue, oldValue, scope){
                scope.counter++;
            });
            expect(scope.counter).toBe(0);

            scope.$digest();

            expect(scope.counter).toBe(1);

            scope.$digest();

            expect(scope.counter).toBe(1);

            scope.foo = "b";

            expect(scope.counter).toBe(1);

            scope.$digest();

            expect(scope.counter).toBe(2);
        });

        it("calls listener when watch value is first undefined", function(){
            scope.counter = 0;

            scope.$watch(
                function(scope){return scope.foo},
                function(newValue, oldValue, scope){scope.counter++;}
            );

            scope.$digest();

            expect(scope.counter).toBe(1);
        });

        it("calls listerner with newValue as oldValue the first time", function(){
            scope.foo = "a";
            var oldValueGiven;

            scope.$watch(
                function(scope){return scope.foo},
                function(newValue, oldValue, scope){oldValueGiven = oldValue;}
            );

            scope.$digest();

            expect(oldValueGiven).toBe("a");
        });

        it("watchers that omit the listener function", function(){
            var watcherFn = jasmine.createSpy();

            scope.$watch(watcherFn);

            scope.$digest();

            expect(watcherFn).toHaveBeenCalled();
        });

        it("triggers chained watchers in the same digest", function(){
            scope.name = "Jane";

            scope.$watch(
                function(scope){return scope.nameUpper;},
                function(newValue, oldValue, scope){
                    if (newValue){
                        scope.initial = newValue.substring(0, 1) + ".";
                    }
                }
            );

            scope.$watch(
                function(scope){return scope.name;},
                function(newValue, oldValue, scope){
                    if (newValue){
                        scope.nameUpper = newValue.toUpperCase();
                    }
                }
            );

            scope.$digest();
            expect(scope.initial).toBe("J.");

            scope.name = "Bob";

            scope.$digest();

            expect(scope.initial).toBe("B.");
        });

        it("_k_ triggers chained watchers in the same digest", function(){
            scope.bar = "bar";

            var watchFoo = function(scope){
                return scope.foo;
            };
            var watchBar = function(scope){return scope.bar;};

            scope.$watch(watchFoo, function(newValue, oldValue, scope){
                if (newValue){
                    scope.foobar = "foobar";
                }
            });

            scope.$watch(watchBar, function(newValue, oldValue, scope){
                if (newValue){
                    scope.foo = "foo";
                }
            });

            scope.$digest();
            expect(scope.foobar).toBe("foobar");
        });

        it("giving up on the watches after 10 iterations", function(){
            scope.foo = 0;
            scope.bar = 1;

            scope.$watch(
                function(){return scope.foo},
                function(){
                    scope.bar++;
                }
            );

            scope.$watch(
                function(){return scope.bar},
                function(){
                    scope.foo++;
                }
            );

            expect(function(){
                scope.$digest();
            }).toThrow();
        });
/*
        it("ends the digest when the last watch is clean", function(){
            scope.array = _.range(100);

            var watchExecution = 0;

            _.times(100, function(i){
                scope.$watch(
                    function(scope){
                        watchExecution++;
                        return scope.array[i];
                    },
                    function(){ }
                )
            });

            scope.$digest();

            expect(watchExecution).toBe(200);

            scope.array[0] = 420;
            scope.$digest();

            expect(watchExecution).toBe(301);
        });*/
    });


});
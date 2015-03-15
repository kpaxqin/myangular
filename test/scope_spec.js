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

            scope.$$watch(watchFn, listenerFn);

            scope.$$digest();

            expect(listenerFn).toHaveBeenCalled();

        });
        it("calls the watcher with the scope as the argument", function(){
            var watchFn = jasmine.createSpy();
            var listenerFn = function(){};

            scope.$$watch(watchFn, listenerFn);

            scope.$$digest();

            expect(watchFn).toHaveBeenCalledWith(scope);
        });
        it("calls the listener function when the watched value changes", function(){
            scope.foo = "a";
            scope.counter = 0;

            scope.$$watch(function(scope){
                return scope.foo;
            }, function(newValue, oldValue, scope){
                scope.counter++;
            });
            expect(scope.counter).toBe(0);

            scope.$$digest();

            expect(scope.counter).toBe(1);

            scope.$$digest();

            expect(scope.counter).toBe(1);

            scope.foo = "b";

            expect(scope.counter).toBe(1);

            scope.$$digest();

            expect(scope.counter).toBe(2);
        });

        it("calls listener when watch value is first undefined", function(){
            scope.counter = 0;

            scope.$$watch(
                function(scope){return scope.foo},
                function(newValue, oldValue, scope){scope.counter++;}
            );

            scope.$$digest();

            expect(scope.counter).toBe(1);
        });

        it("calls listerner with newValue as oldValue the first time", function(){
            scope.foo = "a";
            var oldValueGiven;

            scope.$$watch(
                function(scope){return scope.foo},
                function(newValue, oldValue, scope){oldValueGiven = oldValue;}
            );

            scope.$$digest();

            expect(oldValueGiven).toBe("a");
        });
    });


});
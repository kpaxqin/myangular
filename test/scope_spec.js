/**
 * Created by kpaxqin@github on 15-3-15.
 */
/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

describe("Scope", function(){
    //scope应该是简单对象
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

        //$digest执行时监听器能被执行至少一次
        it("calls the listener function of a watch on first $digest", function(){
            var watchFn = function(){
                return "wat";
            };
            var listenerFn = jasmine.createSpy();

            scope.$watch(watchFn, listenerFn);

            scope.$digest();

            expect(listenerFn).toHaveBeenCalled();

        });

        //watcher的参数为scope
        it("calls the watcher with the scope as the argument", function(){
            var watchFn = jasmine.createSpy();
            var listenerFn = function(){};

            scope.$watch(watchFn, listenerFn);

            scope.$digest();

            expect(watchFn).toHaveBeenCalledWith(scope);
        });

        //当watcher值发生变化时，listener能得到执行
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

            //至少执行一次listener
            expect(scope.counter).toBe(1);

            scope.$digest();

            expect(scope.counter).toBe(1);

            scope.foo = "b";

            expect(scope.counter).toBe(1);

            scope.$digest();

            //脏时执行第二次
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

        //初次调用listener时，oldValue值应该是newValue(即当前value)
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
        });
        /*
        * 第一轮脏检测执行listener时会将外层watcher认为是lastDirty，但是listenerFn中又注册了新的watcher
        * 第二轮脏检测时到lastDirty就会停下来，忽略掉新的watcher
        * 解决方案是$watch时重置$$lastDirtyWatch
        * */
        it("does not end digest so that new watches are not run", function(){
            scope.foo = "abc";
            scope.counter = 0;

            scope.$watch(
                function(scope){return scope.foo;},
                function(newV, oldV, scope){
                    scope.$watch(
                        function(scope){return scope.foo;},
                        function(newV, oldV, scope){
                            scope.counter++;
                        }
                    )
                }
            );
            scope.$digest();
            expect(scope.counter).toBe(1);
        });

        it("compare based on value if enabled", function(){
            scope.arr = [1, 2, 3];
            scope.counter = 0;

            scope.$watch(
                function(scope){
                    return scope.arr;
                },
                function(newValue, oldValue, scope){
                    scope.counter++;
                },
                true
            );
            scope.$digest();

            expect(scope.counter).toBe(1);

            scope.arr.push(4);

            scope.$digest();
            expect(scope.counter).toBe(2);
        });

        it("correctly handles NaNs", function(){
            scope.number = 0/0;

            scope.counter = 0;

            scope.$watch(
                function(scope){
                    return scope.number;
                },
                function(newValue, oldValue, scope){
                    scope.counter++;
                }
            );

            scope.$digest();

            expect(scope.counter).toBe(1);
        });

        it("execute $eval'ed function and returns result", function(){
            scope.foo = 10;

            var result = scope.$eval(function(scope){
                return scope.foo;
            });

            expect(result).toBe(10);
        });

        it("passes the second $eval argument straight through", function(){
            scope.aValue = 10;

            var result = scope.$eval(function(scope, arg){
                return scope.aValue + arg;
            }, 1);

            expect(result).toBe(11);
        });

        it("executes $apply'ed function and starts the digest", function(){
            scope.foo = "foo";
            scope.counter = 0;

            scope.$watch(
                function(scope){return scope.foo;},
                function(newValue, oldValue, scope){
                    scope.counter++;
                }
            );

            scope.$digest();

            expect(scope.counter).toBe(1);

            scope.$apply(function(scope){
                scope.foo = "bar";
            });

            expect(scope.counter).toBe(2);
        });

        it("executes $evalAsynced function later in the same cycle", function(){
            scope.aValue = [0, 1, 2];

            scope.asyncEvaluated = false;
            scope.asyncEvaluatedImmediately = false;

            scope.$watch(
                function(scope){
                    return scope.aValue;
                },
                function(newValue, oldValue, scope){
                    scope.$evalAsync(function(scope){
                        scope.asyncEvaluated = true;
                    });

                    scope.asyncEvaluatedImmediately = scope.asyncEvaluated;
                }
            );

            scope.$digest();

            expect(scope.asyncEvaluated).toBe(true);

            expect(scope.asyncEvaluatedImmediately).toBe(false);
        });

        it("execute $evalAsync function added by watch function", function(){
            scope.aValue  = [1];
            scope.asyncEvaluated = false;

            scope.$watch(
                function(scope){
                    if (!scope.asyncEvaluated){
                        scope.$evalAsync(function(scope){
                            scope.asyncEvaluated = true;
                        });
                    }
                },
                function(){}
            );

            scope.$digest();

            expect(scope.asyncEvaluated).toBe(true);
        });

        it("execute $evalAsync function added by watch function", function(){
            scope.aValue  = [1];
            scope.asyncEvaluatedTimes = 0;

            scope.$watch(
                function(scope){
                    if (scope.asyncEvaluatedTimes < 2){
                        scope.$evalAsync(function(scope){
                            scope.asyncEvaluatedTimes++;
                        });
                    }
                },
                function(){}
            );

            scope.$digest();

            expect(scope.asyncEvaluatedTimes).toBe(2);
        });

        it("eventually halts $evalAsyncs added by watches", function(){
            scope.aValue = [1];

            scope.$watch(
                function(scope){
                    scope.$evalAsync(function(scope){});

                    return scope.aValue;
                },
                function(){
                }
            );

            expect(function(){scope.$digest();}).toThrow();

        });

        it("phase", function(){
            scope.aValue = [1];

            scope.phaseInWatch = undefined;
            scope.phaseInListener = undefined;
            scope.phaseInApply = undefined;

            scope.$watch(
                function(scope){
                    scope.phaseInWatch = scope.$$phase;
                    return scope.aValue;
                },
                function(newValuem, oldValue, scope){
                    scope.phaseInListener = scope.$$phase;
                }
            );

            scope.$digest();

            scope.$apply(function(scope){
                scope.phaseInApply = scope.$$phase;
            });

            expect(scope.phaseInWatch).toBe("$digest");
            expect(scope.phaseInListener).toBe("$digest");
            expect(scope.phaseInApply).toBe("$apply");
        });

        it("schedules a digest in $evalAsync", function(done){
            scope.aValue = "abc";

            scope.counter = 0;

            scope.$watch(
                function(scope){
                    return scope.aValue;
                },
                function(newValue, oldValue, scope){
                    scope.counter++;
                }
            );

            scope.$evalAsync(function(scope){});

            setTimeout(function(){
                expect(scope.counter).toBe(1);
                done();
            });
        });
    });



});
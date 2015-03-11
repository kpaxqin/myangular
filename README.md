#Build your own AngularJS 手记

最近在看 [build your own angularjs](http://teropa.info/build-your-own-angular) ，打算跟着书中的代码敲一遍，加深对AngularJS的理解。在这里记录过程中的问题与心得。

##Introduction
有意思的一段话
>I hate working with technologies I don’t quite understand. Too often, it leads to
code that just happens to work, not because you truly understand what it does, but
because you went through a lot of trial and error to make it work

值得反思，平常工作中的代码，有多少是**just happens to work after a lot of trial and error**，有多少是**you truly understand what it does**

##Project Setup （项目脚手架）

没什么技术问题，主要是踩坑，记录如下

* P15. **Include Lo-Dash And jQuery**。Gruntfile配置中的testem.unit.options.serve_files项，`node_modules/lodash/lodash.js `在最新版本中应为 `node_modules/lodash/index.js`

* 运行`grunt testem:run:unit` 命令行报 `atal error: spawn ENOENT`
解决：https://github.com/teropa/build-your-own-angularjs/issues/88

* windows下`npm install -g phantomjs`失败
解决：最新版本phantomjs的问题，指定较低版本可解决

* windows下运行`grunt testem:run:unit` 内存被大量node与cmd进程耗尽
解决：为解决上个问题，我install了1.9.10版本。根据排查内存耗尽应该是这个版本的问题，换成1.9.11后问题消失。命令：`npm install -g phantomjs@1.9.11`。（吐槽：这货到底有多少问题啊）

值得一提的是TDD的开发方式，贯穿全书始终。以前较少使用TDD，而这正是以Angular、React为代表的新一代前端技术极力倡导的开发方式，希望通过这本书能加深对TDD的认识

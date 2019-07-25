/**
 * 定义入口模块（main）的类，模块名称xyyerp
 *
 * @type {*|module|angular.Module}
 */


var main = angular.module('xyyerp', ['myApp.myDirective']);
main.run(function ($rootScope, $interval) {
    if (!$rootScope._model) {
        $rootScope._model = new $Model();
    }
    if (!$rootScope._env) {
        $rootScope._env = new $Env();
    }
    //如果存在如下对象，则扩展之
    try{
        mixer(ERPApp, $rootScope);
    }catch(e){

    }

});




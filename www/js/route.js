/**
 * Created by Shao on 2016/12/13.
 */

angular.module('wms.route', [])
  .config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/app/home');
    $stateProvider

    /**
     * wms路由配置 开始
     */

      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'loginCtrl'
      })
      .state('app', {
        abstract: true,
        cache: false,
        url: '/app',
        templateUrl: 'views/app.html',
        controller: 'appCtrl'
      })

      .state('rukushangjiaList', {
        url: '/rukushangjiaList?BillDtlID',
        templateUrl: 'views/rukushangjiaList.html',
        controller: "rukushangjiaListCtrl"
      })
      .state('chukujianhuo', {
        url: '/chukujianhuo',
        cache: false,
        templateUrl: 'views/chukujianhuo.html',
        controller: "chukujianhuoCtrl"
      })
      .state('jianhuoshangpingList', {
        url: '/jianhuoshangpingList',
        cache: false,
        templateUrl: 'views/jianhuoshangpingList.html',
        controller: "jianhuoshangpingListCtrl"
      })
      .state('jianhuoshangpingDetail', {
        url: '/jianhuoshangpingDetail/:BillDtlID',
        cache: false,
        templateUrl: 'views/jianhuoshangpingDetail.html',
        controller: "jianhuoshangpingDetailCtrl"
      })
      .state('fenpeifuhetai', {
        cache: false,
        url: '/fenpeifuhetai',
        templateUrl: 'views/fenpeifuhetaixinxi.html',
        controller: "fenpeifuhetaiCtrl"
      })
      //主页
      .state('app.home', {
        url: '/home',
        cache: false,
        views: {
          'home': {
            templateUrl: 'views/home.html',
            controller: "homeCtrl"
          }
        }
      })

      .state('app.home.rukushangjia', {
        url: '/rukushangjia',

        views: {
          'rukushangjia': {
            templateUrl: 'views/rukushangjia.html',
            controller: "rukushangjiaCtrl"
          }
        }
      })

      .state('app.home.chukujianhuo', {
        url: '/chukujianhuo',
        cache: false,
        views: {
          'chukujianhuo': {
            templateUrl: 'views/chukujianhuo.html',
            controller: "chukujianhuoCtrl"
          }
        }
      })

      .state('app.home.coming', {
        url: '/coming',
        views: {
          'coming': {
            templateUrl: 'views/coming.html',
            controller: "comingCtrl"
          }
        }
      })


      .state('app.tasks', {
        url: '/tasks',
        cache: false,
        views: {
          'tasks': {
            templateUrl: 'views/tasks.html',
            controller: "tasksCtrl"
          }
        }
      })
      .state('app.statsbars', {
        url: '/statsbars',
        cache: false,
        views: {
          'statsbars': {
            templateUrl: 'views/statsbars.html',
            controller: "statsbarsCtrl"
          }
        }
      })
      .state('app.mine', {
        url: '/mine',
        cache: false,
        views: {
          'mine': {
            templateUrl: 'views/mine.html',
            controller: "mineCtrl"
          }
        }
      })



      /*
       任务模块route
       */
      .state('app.tasks.rukushangjiatasks', {
        url: '/rukushangjiatasks',
        cache: false,
        views: {
          'rukushangjiatasks': {
            templateUrl: 'views/rukushangjiatasks.html',
            controller: "rukushangjiatasksCtrl"
          }
        }
      })

      .state('app.tasks.chukujianhuotasks', {
        url: '/chukujianhuotasks',
        cache: false,
        views: {
          'chukujianhuotasks': {
            templateUrl: 'views/chukujianhuotasks.html',
            controller: "chukujianhuotasksCtrl"
          }
        }
      })
      .state('app.tasks.chukuneifuhetasks', {
        url: '/chukuneifuhetasks',
        cache: false,
        views: {
          'chukuneifuhetasks': {
            templateUrl: 'views/chukuneifuhetasks.html',
            controller: "chukuneifuhetasksCtrl"
          }
        }
      })
      .state('app.tasks.chukuwaifuhetasks', {
        url: '/chukuwaifuhetasks',
        cache: false,
        views: {
          'chukuwaifuhetasks': {
            templateUrl: 'views/chukuwaifuhetasks.html',
            controller: "chukuwaifuhetasksCtrl"
          }
        }
      })
      .state('app.tasks.kuneibuhuotasks', {
        url: '/kuneibuhuotasks',
        cache: false,
        views: {
          'kuneibuhuotasks': {
            templateUrl: 'views/kuneibuhuotasks.html',
            controller: "kuneibuhuotasksCtrl"
          }
        }
      })


    /**
     * wms路由配置 结束
     */


  });

/**
 * Created by administrator on 2018/01/05.
 */

// window.baseUrl = "http://172.16.101.34:8899";//wsj
// wms

//window.baseUrl = "http://localhost:89";
window.baseUrl = "http://172.16.101.249:8089";
//window.baseUrl = "http://172.16.101.129:89";


angular.module('wms.controllers', ['cdtApp.servics'])
/**
 * WMS Controller 开始
 */

  .controller('mainCtrl', function ($scope, $state, $rootScope) {

    // 从缓存获取用户数据
    if (localStorage.getItem("userInformation")) {
      $rootScope.user = JSON.parse(localStorage.getItem("userInformation"));
    }
    // 路由状态开始改变
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      // console.log("路由开始改变")
      var userInformation = localStorage.getItem("userInformation");
      // console.log("userInformation:", userInformation);
      // console.log("$state:", $state);
      // 校验是否登录
      if (!userInformation && toState.name !== "login") {
        // 取消默认跳转行为
        event.preventDefault();
        $state.go("login");
      }
    });
    // 路由状态改变完成
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      // console.log("路由改变完成")

    });

  })
  .controller('loginCtrl', function ($scope, $rootScope, $http, $state, $ionicViewSwitcher, $cordovaDialogs, $cordovaToast, $ionicPlatform) {

    $scope.user = {};

    $ionicPlatform.registerBackButtonAction(function (e) {
      //阻止物理返回
      //返回上个视图=100；
      // 关闭侧栏菜单=150；
      // 关闭Modal=200；
      // 关闭 action sheet=300；
      // 关闭popup=400；
      // 关闭loading=500；
      e.preventDefault();
    }, 501);

    // $scope.$on('$ionicView.beforeEnter', function () {
    //   if (!window.isOnline) {
    //     $state.go("offline");
    //   }
    //   $scope.user = {};
    //   $scope.showVerCode = false;
    // });
    // console.log(user.img);
    $scope.login = function () {

      //$state.go("app.home");

      var user = $scope.user;
      $scope.user.isMoblie = true;
      if (!user.mobile) {
        $cordovaDialogs.alert('请输入手机号', '', '确定')
        return;
      }
      if (!user.pwd) {
        $cordovaDialogs.alert('密码小于6位数或未输入密码', '', '确定')
        return;
      }
      if (!user.authCode) {
        $cordovaDialogs.alert('请输入验证码', '', '确定')
        return;
      }
      var myreg = /(^13\d{9}$)|(^14)[5,7]\d{8}$|(^15[0,1,2,3,5,6,7,8,9]\d{8}$)|(^17)[0,6,7,8]\d{8}$|(^18\d{9}$)/;
      if (!myreg.test(user.mobile)) {
        $scope.user.isMoblie = false;
      }
      //获取当前用户登录信息
      var curLoginInfo = localStorage.getItem(user.mobile);
      //初始化用户登录信息
      if (!curLoginInfo) {
        curLoginInfo = {"usercode": user.mobile, "failedLoginCount": 0, "lock": 0};
      } else {
        curLoginInfo = JSON.parse(curLoginInfo);
      }
      //是否锁定
      var lock = curLoginInfo.lock;
      if (lock == 1) {
        var locktime = curLoginInfo.lockTime;
        if (lockTime) {
          var time = parseInt((new Date().getTime()) / 1000);
          if (time < (locktime + 3600)) {
            $cordovaDialogs.alert('您的账号目前处于锁定状态，请您等' + (60 - parseInt((time - locktime) / 60) + 1) + '分钟再登录', '', '确定')
            return;
          } else {
            curLoginInfo.lock = 0;//解除锁定
          }
        }
      } else {
        curLoginInfo.lock = 0;
      }

      var envelop = new Envelop("login");
      envelop.body.usercode = user.mobile;
      envelop.body.isMoblie = user.isMoblie;
      envelop.body.pwd = user.pwd;
      envelop.body.authCode = user.authCode;
      envelop.body.orgId = user.orgId;

      NProgress.start();
      $http({
        method: "POST",
        url: baseUrl + "/app/login",
        params: {requestMsg: envelop}
      }).success(function (result) {
        NProgress.done();
        if (result.status == 1) {
          // 用户信息
          $rootScope.user = result.message;

          console.log(JSON.stringify(result.message));

          localStorage.setItem("userInformation", JSON.stringify(result.message));

          localStorage.setItem("userId", result.message.id);
          localStorage.setItem("userName", result.message.loginName);
          localStorage.setItem("userTel", result.message.mobile);
          localStorage.setItem("orgcode", result.message.orgCode);
          localStorage.setItem("orgcodes", result.message.orgCodes);
          localStorage.setItem("password", result.message.password);

          curLoginInfo.lastSuccessLoginTime = (new Date()).Format("yyyy-M-d h:m:s.S");
          curLoginInfo.failedLoginCount = 0;
          curLoginInfo.lock = 0;
          curLoginInfo.lockTime = null;
          //保存
          localStorage.setItem(user.mobile, JSON.stringify(curLoginInfo));
          // 页面切换动画。
          $ionicViewSwitcher.nextDirection('forward');
          $state.go("app.home");
        } else {
          curLoginInfo.lastFailedLoginTime = (new Date()).Format("yyyy-M-d h:m:s.S");
          var count = curLoginInfo.failedLoginCount;
          if (!count) {
            count = 0;
          } else {
            count = Number(count);
          }
          count += 1;
          if (count >= 2 && count < 5) {
            $cordovaDialogs.alert(result.message + "，您还有" + (5 - count) + "次机会，连续输入错误次数超过5次，账号将被锁定", '', '确定');
          } else if (count >= 5) {
            $cordovaDialogs.alert('由于您的输入次数超过5次，账号已被锁定,请您一个小时后再登录', '', '确定')
            curLoginInfo.lock = 1;
            curLoginInfo.lockTime = parseInt((new Date().getTime()) / 1000);
          } else {
            $cordovaDialogs.alert(result.message, '', '确定');
          }
          curLoginInfo.failedLoginCount = count;
          //保存
          localStorage.setItem(user.mobile, JSON.stringify(curLoginInfo));
        }
      });
    };
    //

    $scope.setVerCodeShow = function () {
      if ($scope.user.mobile && $scope.user.mobile !== '') {

        $scope.showVerCode = true;
        $scope.user.src = baseUrl + '/authimg/appLogin?m=' + $scope.user.mobile;
      } else {
        $scope.showVerCode = false;
      }
      //获取用户机构信息
      var myreg = /(^13\d{9}$)|(^14)[5,7]\d{8}$|(^15[0,1,2,3,5,6,7,8,9]\d{8}$)|(^17)[0,6,7,8]\d{8}$|(^18\d{9}$)/;
      if (myreg.test($scope.user.mobile)) {
        $scope.user.isMoblie = true;
      } else {
        $scope.user.isMoblie = false;
      }
      ;

      var envelop = new Envelop("getOrgInfo");
      envelop.body.username = $scope.user.mobile;
      envelop.body.isMoblie = $scope.user.isMoblie;

      $http({
        method: "POST",
        url: baseUrl + "/app/org",
        params: {requestMsg: envelop}
      }).success(function (result) {
        if (result) {
          $scope.organization = result.data;
          $scope.user.orgId = $scope.organization[0].id;
        } else {
          $scope.organization = '';
          // $scope.user.orgId=''
        }
      });
    };
    $scope.getVerCode = function () {
      var _code = Math.random();
      $scope.user.src = baseUrl + '/authimg/appLogin?rnd=' + _code + '&m=' + $scope.user.mobile;
    }

  })
  .controller('appCtrl', function ($scope, $state, $interval, $ionicViewSwitcher, $ionicModal, $ionicSlideBoxDelegate, $ionicSideMenuDelegate, $timeout, $cordovaInAppBrowser, $cordovaDialogs, $cordovaToast, $cordovaProgress, $cordovaToast, $ionicHistory) {
    // 退出登录
    $scope.logout = function () {
      $cordovaDialogs.confirm('是否确定退出？', '', ['取消', '确定'])
        .then(function (buttonIndex) {
          if (buttonIndex == 1) {
            $scope.cilentID = localStorage.getItem("clientID");
            localStorage.clear();
            localStorage.setItem('isQuit', 1);
            localStorage.setItem("clientID", $scope.cilentID);
            $state.go('login');
          }
        });
    };
  })
  .controller('homeCtrl', function ($scope, $cordovaBarcodeScanner) {
  })
  .controller('tasksCtrl', function ($scope, $state, $ionicViewSwitcher, $ionicHistory) {

  })
  .controller('statsbarsCtrl', function ($scope, $http, $state, $ionicViewSwitcher, $ionicHistory) {
    $scope.chart = {};
    $scope.loadChart = function () {
      var envelop = new Envelop("statsbars");
      envelop.body.username = "admins";
      envelop.body.beginTime = formatDate($scope.chart.beginTime);
      envelop.body.endTime = formatDate($scope.chart.endTime);
      NProgress.start();
      $http({
        method: 'POST',
        url: baseUrl + "/app/statsbars",
        params: {requestMsg: envelop}
      }).success(function (response) {
        NProgress.done();
        if (!response || response.message == '') {
          alert("数据异常");
          return;
        }
        ;
        var data = response.message.chaxunbaobiao;
        $scope.barConfig = {
          theme: 'default',
          dataLoaded: true
        };
        $scope.barOption = {
          title: {
            text: '',
            subtext: ''
          },
          tooltip: {
            show: true,
            formatter: "{a} <br/>{b} : {c}"
          },
          // 图例
          legend: {
            data: data.legend
          },
          // 数据内容数组
          xAxis: {
            data: data.ydatas
          },
          yAxis: {},
          series: data.xdatas
        };
      }).error(function (err) {
        NProgress.done();
        alert("请求超时");
      });
    }
    $scope.loadChart();

  })
  .controller('mineCtrl', function ($scope, $state, $ionicViewSwitcher, $ionicHistory) {

  })
  .controller('rukushangjiaCtrl', function ($scope, $state, $ionicViewSwitcher, $ionicHistory, $http, $cordovaBarcodeScanner) {
    var envelop = new Envelop("rukushangjia");
    envelop.body.pageSize = 5;
    envelop.body.pageIndex = 1;
    envelop.body.totalCount = 1;
    $scope.hasData=false;
    $scope.shangpin=[];
    $scope.loadData = function (req) {
      NProgress.start();
      $http({
        method:"POST",
        url:baseUrl + "/wmsRkSj/route/rukushangjia",
        params:{requestMsg:req}
      }).success(function (res) {
        NProgress.done();
        if(res.status==1) {
          $scope.shangpin=$scope.shangpin.concat(res.result.recordList);
          $scope.hasData = res.result.hasData;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }else {
          alert("数据异常");
        }
      }).error(function (err) {
        alert("请求超时" + err);
        NProgress.done();
        $scope.hasData = true;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.load = function () {
      $scope.loadData(envelop);
    };
    $scope.load();

    $scope.loadMore = function () {
      $scope.hasData = false;
      if (null != envelop) {
        envelop.body.pageIndex = envelop.body.pageIndex + 1;
        $scope.loadData(envelop, 1);
      }
    };

    $scope.input = {bianhao: ""};
    $scope.huowei ={shangpinbianhao:""};
    //扫描
    $scope.tpsaomiao = function () {
      $cordovaBarcodeScanner.scan().then(function (imageData) {
       /* $scope.input.bianhao = imageData.text;*/
        var rongqibianhao = imageData.text;
        NProgress.start();
        $http({
          method: "POST",
          url: baseUrl + "/wmsRkSj/route/rukushangjiainfo",
          params: {rongqibianhao: rongqibianhao}
        }).success(function (data) {
          NProgress.done();
          console.log("data", data);
          if(data.status==1) {
            $scope.shangpinObj = data.result;
            if($scope.shangpinObj.size()>0) {
              var  BillDtlID = $scope.shangpinObj[0].BillDtlID;
              $state.go('rukushangjiaList',{"BillDtlID":BillDtlID});
            }else {
              alert("暂无数据");
            }

          }else {
            alert("请求超时");
          }
        });
      }, function (error) {
        alert("error:", error);
        console.log("An error happened -> " + error);
      });
    };

    $scope.spsaomiao = function () {
      $cordovaBarcodeScanner.scan().then(function (imageData) {
        $scope.huowei.shangpinbianhao = imageData.text;
      }, function (error) {
        alert("error:", error);
        console.log("An error happened -> " + error);
      });
    };



    //查询
    $scope.searchSj = function () {

      var rongqibianhao = $scope.input.bianhao;
      var huoweibianhao = $scope.huowei.shangpinbianhao;
      NProgress.start();
      console.log("rongqibianhao", rongqibianhao);
      $http({
        method: "POST",
        url: baseUrl + "/wmsRkSj/route/rukushangjia",
        params: {rongqibianhao: rongqibianhao,huoweibianhao:huoweibianhao}
      }).success(function (data) {
        NProgress.done();
        console.log("data", data);
        $scope.shangpin = data.result;

      });
    }
  })
  .controller('rukushangjiaListCtrl', function ($scope, $state, $stateParams, $ionicViewSwitcher, $ionicHistory, $http,$cordovaBarcodeScanner) {
    $scope.x = {
      zhengjianshu: 0,
      lingsanshu: 0
    };
    console.log("$stateParams:", $stateParams);
    var BillDtlID = $stateParams.BillDtlID;
    console.log("id:", BillDtlID);
    $http({
      method: "POST",
      url: baseUrl + "/wmsRkSj/route/rukushangjiainfo",
      params: {BillDtlID: BillDtlID}
    }).success(function (data) {
      console.log("data", data);
      $scope.x = data.result[0];

    });

    //扫描货位
    $scope.sihwsaomiao = function () {
      $cordovaBarcodeScanner.scan().then(function (imageData) {
        $scope.x.shijihuowei = imageData.text;
      }, function (error) {
        alert("error:", error);
        console.log("An error happened -> " + error);
      });
    };

    //计算数量（根据零散数跟整件数乘以大包装的和动态得到数量 用于拆分时）
    $scope.calcSL = function () {
      $scope.x.syshuliang = Number($scope.x.lingsanshu) + (Number($scope.x.zhengjianshu) * Number($scope.x.baozhuangshuliang));
    };

    //确定
    $scope.queding = function () {
      var pa = $scope.x;
      console.log("pa", pa);
      $http({
        method: "POST",
        url: baseUrl + "/wmsRkSj/route/saveSj",
        params: {spObj: pa}
      }).success(function (data) {
        if (data.status == 1) {
          if (data.result === "complete") $state.go("rukushangjia");
          else  $scope.x=data.result;
        }
      }).error(function (err) {
        alert("保存失败");
      })
    }

    //校验实际货位不能为空
    $scope.cheeck = function () {
      var shijihuowei = $scope.x.shijihuowei;
      if (shijihuowei == null) {
        alert("实际货位不能为空")
      } else {
        $http({
          method: "POST",
          url: baseUrl + "/wmsRkSj/route/isExist",
          params: {shijihuowei: shijihuowei}
        }).success(function (data) {
          console.log("data", data);
          var result = data.result;
          if (result == "") {
            alert("输入货位不存在，请重输！！！");
          }
        }).error(function (err) {
          alert("查询失败");

        })
      }
    }
    //拆分
    $scope.chaifen = function () {
      $scope.all = true;
    }

  })
  /*
    任务模块
    */
  .controller('rukushangjiatasksCtrl', function ($scope, $state, $ionicViewSwitcher, $ionicHistory, $http) {
    var envelop = new Envelop("rukushangjia");
    envelop.body.pageSize = 5;
    envelop.body.pageIndex = 1;
    envelop.body.totalCount = 1;
    $scope.hasData = false;
    $scope.shangpin=[];
    $scope.loadData = function (req, loadType) {
      NProgress.start();
      $http({
        method: "post",
        url: baseUrl + "/app/rukushangjia",
        params: {requestMsg: req}
      }).success(function (res) {
        NProgress.done();
        if(res.status == 1) {
          $scope.shangpin=$scope.shangpin.concat(res.message.recordList);
          $scope.hasData = res.message.hasData;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        } else {
          alert("数据异常，稍后请重试！", '', '确定');
        }
      }).error(function (err) {
        alert("请求超时" + err);
        NProgress.done();
        $scope.hasData = true;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.load = function () {
      $scope.loadData(envelop);
    };
    $scope.load();

    $scope.loadMore = function () {
      $scope.hasData = false;
      if (null != envelop) {
        envelop.body.pageIndex = envelop.body.pageIndex + 1;
        $scope.loadData(envelop, 1);
      }
    };
    //
  })




  .controller('chukujianhuotasksCtrl', function ($scope, $state, $ionicViewSwitcher, $ionicHistory, $http) {
    var envelop = new Envelop("chukujianhuo");
       envelop.body.pageSize = 5;
       envelop.body.pageIndex = 1;
       envelop.body.totalCount = 1;
       $scope.hasData = false;
       $scope.shangpin=[];
       $scope.loadData = function (req, loadType) {
         NProgress.start();
         $http({
           method: "post",
           url: baseUrl + "/app/chukujianhuo",
           params: {requestMsg: req}
         }).success(function (res) {
           NProgress.done();
           if(res.status == 1) {
             $scope.shangpin=$scope.shangpin.concat(res.message.recordList);
             $scope.hasData = res.message.hasData;
             $scope.$broadcast('scroll.infiniteScrollComplete');
           } else {
             alert("数据异常，稍后请重试！", '', '确定');
           }
         }).error(function (err) {
           alert("请求超时" + err);
           NProgress.done();
           $scope.hasData = true;
           $scope.$broadcast('scroll.infiniteScrollComplete');
         });
       };

       $scope.load = function () {
         $scope.loadData(envelop);
       };
       $scope.load();

       $scope.loadMore = function () {
         $scope.hasData = false;
         if (null != envelop) {
           envelop.body.pageIndex = envelop.body.pageIndex + 1;
           $scope.loadData(envelop, 1);
         }
       };
       //
     })


  .controller('chukuneifuhetasksCtrl', function ($scope, $state, $ionicViewSwitcher, $ionicHistory, $http) {
   var envelop = new Envelop("chukuneifuhe");
         envelop.body.pageSize = 5;
         envelop.body.pageIndex = 1;
         envelop.body.totalCount = 1;
         $scope.hasData = false;
         $scope.shangpin=[];
         $scope.loadData = function (req, loadType) {
           NProgress.start();
           $http({
             method: "post",
             url: baseUrl + "/app/chukuneifuhe",
             params: {requestMsg: req}
           }).success(function (res) {
             NProgress.done();
             if(res.status == 1) {
               $scope.shangpin=$scope.shangpin.concat(res.message.recordList);
               $scope.hasData = res.message.hasData;
               $scope.$broadcast('scroll.infiniteScrollComplete');
             } else {
               alert("数据异常，稍后请重试！", '', '确定');
             }
           }).error(function (err) {
             alert("请求超时" + err);
             NProgress.done();
             $scope.hasData = true;
             $scope.$broadcast('scroll.infiniteScrollComplete');
           });
         };

         $scope.load = function () {
           $scope.loadData(envelop);
         };
         $scope.load();

         $scope.loadMore = function () {
           $scope.hasData = false;
           if (null != envelop) {
             envelop.body.pageIndex = envelop.body.pageIndex + 1;
             $scope.loadData(envelop, 1);
           }
         };
         //
       })









  .controller('chukuwaifuhetasksCtrl', function ($scope, $state, $ionicViewSwitcher, $ionicHistory, $http) {
     var envelop = new Envelop("chukuwaifuhe");
           envelop.body.pageSize = 5;
           envelop.body.pageIndex = 1;
           envelop.body.totalCount = 1;
           $scope.hasData = false;
           $scope.shangpin=[];
           $scope.loadData = function (req, loadType) {
             NProgress.start();
             $http({
               method: "post",
               url: baseUrl + "/app/chukuwaifuhe",
               params: {requestMsg: req}
             }).success(function (res) {
               NProgress.done();
               if(res.status == 1) {
                 $scope.shangpin=$scope.shangpin.concat(res.message.recordList);
                 $scope.hasData = res.message.hasData;
                 $scope.$broadcast('scroll.infiniteScrollComplete');
               } else {
                 alert("数据异常，稍后请重试！", '', '确定');
               }
             }).error(function (err) {
               alert("请求超时" + err);
               NProgress.done();
               $scope.hasData = true;
               $scope.$broadcast('scroll.infiniteScrollComplete');
             });
           };

           $scope.load = function () {
             $scope.loadData(envelop);
           };
           $scope.load();

           $scope.loadMore = function () {
             $scope.hasData = false;
             if (null != envelop) {
               envelop.body.pageIndex = envelop.body.pageIndex + 1;
               $scope.loadData(envelop, 1);
             }
           };
           //
         })


  .controller('kuneibuhuotasksCtrl', function ($scope, $state, $ionicViewSwitcher, $ionicHistory, $http) {
    var envelop = new Envelop("kuneibuhuo");
             envelop.body.pageSize = 5;
             envelop.body.pageIndex = 1;
             envelop.body.totalCount = 1;
             $scope.hasData = false;
             $scope.shangpin=[];
             $scope.loadData = function (req, loadType) {
               NProgress.start();
               $http({
                 method: "post",
                 url: baseUrl + "/app/kuneibuhuo",
                 params: {requestMsg: req}
               }).success(function (res) {
                 NProgress.done();
                 if(res.status == 1) {
                   $scope.shangpin=$scope.shangpin.concat(res.message.recordList);
                   $scope.hasData = res.message.hasData;
                   $scope.$broadcast('scroll.infiniteScrollComplete');
                 } else {
                   alert("数据异常，稍后请重试！", '', '确定');
                 }
               }).error(function (err) {
                 alert("请求超时" + err);
                 NProgress.done();
                 $scope.hasData = true;
                 $scope.$broadcast('scroll.infiniteScrollComplete');
               });
             };

             $scope.load = function () {
               $scope.loadData(envelop);
             };
             $scope.load();

             $scope.loadMore = function () {
               $scope.hasData = false;
               if (null != envelop) {
                 envelop.body.pageIndex = envelop.body.pageIndex + 1;
                 $scope.loadData(envelop, 1);
               }
             };
             //
           })




  .controller('chukujianhuoCtrl', function ($scope, $state, $ionicHistory, $http) {
    $scope.rongqi = {rongqihao: ""};
    $scope.tasks = [];
    $scope.bindRongqihao = function () {
      NProgress.start();
      var envelop = new Envelop("chukujianhuo");
      if ($scope.rongqi.rongqihao) envelop.body.rongqihao = $scope.rongqi.rongqihao;
      //发送请求
      $http({
        method: "POST",
        url: baseUrl + "/wmsPicking/route",
        params: {requestMsg: envelop}
      }).success(function (data) {
        NProgress.done();
        if (data.status == 1) {
          console.log("data.result:", data.result);
          $scope.tasks = data.result;
          var sum = 0;
          for (var i = 0; i < data.result.length; i++) {
            sum += data.result[i].tiaomushu;
          }
          $scope.sum = sum;
        } else if (data.status == 0) {
          alert(data.result);
        }
      }).error(function (err) {
        alert("请求超时");
        NProgress.done();
      });
    };
    $scope.bindRongqihao();


  })
  .controller('jianhuoshangpingListCtrl', function ($scope, $state, $stateParams, $http, $ionicHistory, $cordovaBarcodeScanner) {

    $scope.shangping = {goodsid: ""};
    var envelop = new Envelop("goodsList");
    $scope.goodsList = [];
    $scope.loadData = function (req) {
      NProgress.start();
      $http({
        method: "post",
        url: baseUrl + "/wmsPicking/route",
        params: {requestMsg: req}
      }).success(function (data) {
        NProgress.done();
        if (data.status == 1) {
          $scope.goodsList = data.result;
        } else {
          alert("数据异常，稍后请重试！", '', '确定');
        }
      }).error(function (err) {
        $scope.hasData = true;
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.load = function () {
      $scope.loadData(envelop);
    };
    $scope.load();
    //扫描条码；


    $scope.scanBarcode = function () {
      $cordovaBarcodeScanner.scan().then(function (imageData) {
        $scope.shangping.goodsid = imageData.text;
        $scope.load();
      }, function (error) {

      });

    };
    //返回上一个页面
    $scope.goBack = function () {
      $ionicHistory.goBack()
    }
  })
  .controller('jianhuoshangpingDetailCtrl', function ($scope, $state, $stateParams, $http, $ionicHistory) {
    // 获取参数
    var BillDtlID = $stateParams.BillDtlID;
    // 请求后台
    $scope.getDetail = function (billdtlid) {
      var envelop = new Envelop("getGoods");
      if (BillDtlID) envelop.body.BillDtlID = BillDtlID;
      $http({
        method: "post",
        url: baseUrl + "/wmsPicking/route",
        params: {requestMsg: envelop}
      }).success(function (data) {
        if (data.status == 1) {
          $scope.goods = data.result;
        }
      });
    };
    //进入页面查询点击行
    $scope.getDetail(BillDtlID);

    //上下条
    $scope.preLine = function () {
      var envelop = new Envelop("getGoods");
      if ($scope.goods.BillDtlID) envelop.body.BillDtlID = $scope.goods.BillDtlID;
      envelop.body.handle = "preLine";
      $http({
        method: "post",
        url: baseUrl + "/wmsPicking/route",
        params: {requestMsg: envelop}
      }).success(function (data) {
        if (data.status == 1) {
          $scope.goods = data.result;
        } else if (data.status == 0) {
          alert(data.result);
        }
      });
    };
    $scope.nextLine = function () {
      var envelop = new Envelop("getGoods");
      if ($scope.goods.BillDtlID) envelop.body.BillDtlID = $scope.goods.BillDtlID;
      envelop.body.handle = "nextLine";
      $http({
        method: "post",
        url: baseUrl + "/wmsPicking/route",
        params: {requestMsg: envelop}
      }).success(function (data) {
        if (data.status == 1) {
          $scope.goods = data.result;
        } else if (data.status == 0) {
          alert(data.result);
        }
      });
    };

    //返回上一个页面
    $scope.goBack = function () {
      $ionicHistory.goBack()
    }

    //拣货确认
    $scope.queren = function () {

      var envelop = new Envelop("completeTask");
      if ($scope.goods.BillDtlID) envelop.body.BillDtlID = $scope.goods.BillDtlID;

      $http({
        method: "post",
        url: baseUrl + "/wmsPicking/route",
        params: {requestMsg: envelop}
      }).success(function (data) {
        if (data.status == 1) {
          if (data.result === "complete") $state.go("fenpeifuhetai");
          else $scope.goods = data.result;
        }
      })

    }
    //已拣货是否跳转到分配复合台页面
    $scope.isPicking = function () {
      $state.go("fenpeifuhetai", {reload: true});
    }
  })
  .controller('fenpeifuhetaiCtrl', function ($scope, $state, $stateParams, $ionicViewSwitcher, $ionicHistory, $http) {
    /*console.log("$stateParams："+$stateParams);
    var BillDtlID = $stateParams.BillDtlID;
    console.log("BillDtlID:", BillDtlID);*/

    var envelop = new Envelop("getfuhetai");
    //复核区确认，返回拣货列表界面
    $scope.queding = function () {
      var envelop1 = new Envelop("rePicking")
      $http({
        method: "post",
        url: baseUrl + "/wmsPicking/route",
        params: {requestMsg: envelop1}
      }).success(function (data) {
      })
      $state.go("app.home.chukujianhuo");
    }
    //后台分配复核位
    $http({
      method: "post",
      url: baseUrl + "/wmsPicking/route",
      params: {requestMsg: envelop}
    }).success(function (data) {
      if (data.status == 1) {
        $scope.jianhuodanList = data.result;
      }
    })

  })

  /**
   * WMS Controller 结束
   */

  /*.controller('myAccountCtrl', function ($scope, $cordovaDialogs, $state, $ionicViewSwitcher, $ionicHistory) {
    if (!window.isOnline) {
      $state.go("offline");
    }
    $scope.userName = localStorage.getItem("userName");
    $scope.goBack = function () {
      $ionicViewSwitcher.nextDirection('back');
      $backView = $ionicHistory.backView();
      try {
        $backView.go();
      } catch (e) {
        $state.go("home.homeContent");
      }
    };
    $scope.logout = function () {
      $cordovaDialogs.confirm('是否确定退出？', '', ['取消', '确定'])
        .then(function (buttonIndex) {
          if (buttonIndex == 2) {
            $scope.cilentID = localStorage.getItem("clientID");
            localStorage.clear();
            localStorage.setItem('isQuit', 1);
            localStorage.setItem("clientID", $scope.cilentID);
            $state.go('login');
          }
        });
    };

  })*/
  //错误页面
  .controller('errorsCtrl', function ($scope, $ionicBackdrop, $ionicModal, $rootScope, $state, $stateParams, $http, $ionicScrollDelegate, $timeout, $ionicHistory, $interval) {
    $scope.num = $stateParams.id;
  })

  //断网页面
  .controller('offlineCtrl', function ($scope, $state, $ionicViewSwitcher, $ionicHistory) {
    $scope.goBack = function () {
      $ionicViewSwitcher.nextDirection('back');
      $backView = $ionicHistory.backView();
      try {
        $backView.go();
      } catch (e) {
        $state.go("home.homeContent");
      }
    };
    $scope.checkNet = function () {
      if (window.isOnline) {
        $scope.goBack();
      }
    }
  })
    //断网页面
  .controller('comingCtrl', function ($scope, $state, $ionicViewSwitcher, $ionicHistory) {

  })


  /*//  修改密码
  .controller('editPasswordCtrl', function ($scope, $ionicBackdrop, $cordovaToast, $ionicModal, $rootScope, $state, $stateParams, $http, $ionicScrollDelegate, $timeout, $ionicHistory, $ionicViewSwitcher, $interval, $cordovaDialogs) {
    if (!window.isOnline) {
      $state.go("offline");
    }
    $scope.user = {};
    $scope.$on('$ionicView.beforeLeave', function () {
      $scope.user = {};
    })
    //  返回
    $scope.goBack = function () {
      $ionicViewSwitcher.nextDirection('back');
      $backView = $ionicHistory.backView();
      try {
        $backView.go();
      } catch (e) {
        $state.go("home.homeContent");
      }
    };

    $scope.findPwd = function () {
      var user = $scope.user;
      var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/;
      if (!user.pwd) {
        $cordovaDialogs.alert('密码小于6位数或未输入密码', '', '确定')
        return;
      }
      if (!reg.test(user.pwd)) {
        $cordovaDialogs.alert('请输入6-16位且字母加数字的组合', '', '确定')
          .then(function () {
            $scope.user.pwd = '';
            $scope.user.pwd1 = '';
          });
        return;
      }
      if (user.pwd != user.pwd1) {
        $cordovaDialogs.alert('密码输入不一致,请重新输入', '', '确定');
        return;
      }
      var envelop = new Envelop("editPwd");
      envelop.body.id = localStorage.getItem("userId");
      envelop.body.pwd = user.pwd;
      envelop.body.oldpwd = user.oldpwd;
      commonService.sendEnvelop(baseUrl + "/app/editPwd", envelop).then(function (result) {
        var result = eval("(" + result.data + ")");
        if (result.status == 1) {
          $cordovaToast.showShortCenter('密码修改成功，请重新登录');
          localStorage.clear();
          $state.go("login");
        } else {
          $cordovaDialogs.alert(result.errMsg, '', '确定');
        }
      });

    }

  })
*/
  //通用  注入js&css链接到head部分方法
  .factory('Common', [
    '$http', '$q', function ($http, $q) {
      return {
        loadScript: function (url, callback) {
          var head = document.getElementsByTagName("head")[0];
          var script = document.createElement("script");
          script.setAttribute("type", "text/javascript");
          script.setAttribute("src", url);
          script.setAttribute("async", true);
          script.setAttribute("defer", true);
          head.appendChild(script);
          //ie
          if (document.all) {
            script.onreadystatechange = function () {
              var state = this.readyState;
              if (state === 'loaded' || state === 'complete') {
                callback && callback();
              }
            }
          }
          else {
            //firefox, chrome
            script.onload = function () {
              callback && callback();
            }
          }
        },
        loadCss: function (url) {
          var ele = document.createElement('link');
          ele.href = url;
          ele.rel = 'stylesheet';
          if (ele.onload == null) {
            ele.onload = function () {
            };
          }
          else {
            ele.onreadystatechange = function () {
            };
          }
          angular.element(document.querySelector('body')).prepend(ele);
        }
      }
    }
  ])
  //指令部分
  .directive('ngEcharts', [function () {
    return {
      link: function (scope, element, attrs, ctrl) {
        function refreshChart() {
          var theme = (scope.config && scope.config.theme)
            ? scope.config.theme : 'default';
          var chart = echarts.init(element[0], theme);
          if (scope.config && scope.config.dataLoaded === false) {
            chart.showLoading();
          }

          if (scope.config && scope.config.dataLoaded) {
            chart.setOption(scope.option);
            chart.resize();
            chart.hideLoading();
          }

          if (scope.config && scope.config.event) {
            if (angular.isArray(scope.config.event)) {
              angular.forEach(scope.config.event, function (value, key) {
                for (var e in value) {
                  chart.on(e, value[e]);
                }
              });
            }
          }
        };

        //自定义参数 - config
        // event 定义事件
        // theme 主题名称
        // dataLoaded 数据是否加载

        scope.$watch(
          function () {
            return scope.config;
          },
          function (value) {
            if (value) {
              refreshChart();
            }
          },
          true
        );

        //图表原生option
        scope.$watch(
          function () {
            return scope.option;
          },
          function (value) {
            if (value) {
              refreshChart();
            }
          },
          true
        );
      },
      scope: {
        option: '=ecOption',
        config: '=ecConfig'
      },
      restrict: 'EA'
    }
  }])

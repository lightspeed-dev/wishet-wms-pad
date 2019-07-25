
var commonService = angular.module('cdtApp.servics', []);
window.commonService = angular.module('cdtApp.servics', []);

commonService.factory('commonService', ['cordovaHTTP','$http',  function (cordovaHTTP,$http) {

  var sendHttp = function (actionUrl,postData) {
    return $http.post(actionUrl,
      $.param(postData),
      {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
    )
  };

  var find = function (postData,actionUrl) {
    return cordovaHTTP.post(actionUrl,
        //$.param(postData),
        postData,
        {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    )
  };

  var update = function (postData,actionUrl) {
    return cordovaHTTP.post(actionUrl,
        postData,
        {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    )
  };

  window.sendEnvelop=function(actionUrl,envelop){
      var deviceInformation=localStorage.getItem('device');
      var data ={  requestMsg :envelop.getString() , deviceIntro:deviceInformation};
      return  cordovaHTTP.post(actionUrl,
          data,
          {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
      )
  };


  return {
    sendEnvelop: function (actionUrl,envelop) {
      return sendEnvelop(actionUrl,envelop);
    },
    find: function (postData,actionUrl) {
      return find(postData,actionUrl);
    },
    update: function (postData,actionUrl) {
      return update(postData,actionUrl);
    },
    sendHttp: function (actionUrl,postData) {
      return sendHttp(actionUrl,postData);
    }

  };
}]);

//
commonService.factory('localStorageService', [function() {
  return {
    get: function localStorageServiceGet(key, defaultValue) {
      var stored = localStorage.getItem(key);
      try {
        stored = angular.fromJson(stored);
      } catch (error) {
        stored = null;
      }
      if (defaultValue && stored === null) {
        stored = defaultValue;
      }
      return stored;
    },
    update: function localStorageServiceUpdate(key, value) {
      if (value) {
        localStorage.setItem(key, angular.toJson(value));
      }
    },
    clear: function localStorageServiceClear(key) {
      localStorage.removeItem(key);
    }
  };
}]);


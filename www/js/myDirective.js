// var baseUrl="http://172.16.100.142:88/bill";

var userInfo=localStorage.getItem("userInformation");
if (userInfo && userInfo!==""){
  userInfo=window.BASE64.encoder(userInfo);
}else{
  userInfo='';
}
// +"&isMobile=true&userInformation="+userInfo
var myDirectiveModule = angular.module('myApp.myDirective', ['myApp.SharedService','cdtApp.servics']);
var _$util = {

  /**
   * 获取当前域的缓存,每个应用控制器维护一个缓存队列
   * @param scope
   */
  getCDCache:function(scope){
    if(scope._$CACHE)
      return scope._$CACHE;
    var p = scope.$parent;
    while (!p["_$$controller$$"]) {
      p = p.$parent;
    }
    return p._$CACHE;
  },


  /**
   * 获取我所在范围的父
   * 如果范围内有：
   *    (1):_$$view$$，这是一个视图scope对象
   *    (2)：_$$controller$$:这是控制器对象
   *    (3):scope.parent为空，这是rootSceopt
   *   返回对象格式为--result:{type:"view|controller|rootScope",scope:scope}
   *
   *
   * @param scope
   */
  getParent: function (scope) {
    var p = scope.$parent;
    if (p == null) {
      return {type: "rootScope", scope: scope};
    }
    while (!(p["_$$view$$"] || p["_$$controller$$"] || p["_$$popwin$$"])) {
      if (p.$parent == null) {
        return {type: "rootScope", scope: p};
      } else {
        p = p.$parent;
      }
    }

    if (p["_$$view$$"]) {
      return {type: "view", scope: p};
    }else if(p["_$$popwin$$"]){
      return {type: "popwin", scope: p};
    } else {
      return {type: "controller", scope: p};
    }

  }

};

var exprLib = {
  sum: function (a) {
    return a;
  },
  if: function (condition, v1, v2) {
    if (condition) {
      return v1;
    } else {
      return v2;
    }
  }
};


/**
 *   定义模型对象，模型对象中用于存放模型实体
 *
 *    entity:{
							key:modeKey,
						    head:"true|false",是否为头部对象
							cos:[],//对象列表
                            co:{},//操作的对象
                            sos:[],//选择可以对象
                            archetype:{},//对象创建原型
							original:""//原件对象，
	   }
 */


/**
 * 定义抽象指令，其中的方法会被混合到指令中
 * @type {{}}
 */
var abstractDirective = {

  //接口调用
  callService: function (url) {
    debugger;
    var me = this;
    var data = me.$parent._model;
    var postData = {};
    postData.models = JSON.stringify(data);
    var result = this.$http.post(url, $.param(postData),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).success(function (data) {
//                   alert(data);
    }).error(function (err) {
      return;
    });


    return result;
  },

  getRows: function (billKey) {
    var me = this;
    if (this.$parent._model[billKey].sos.length > 0) {
      me._temp = this.$parent._model[billKey].sos;
      return this.$parent._model[billKey].sos;
    } else {
      alert("请选择一行记录")
      return false;
    }
  },


  findRowObject: function (me) {
    var _parent = me.$parent;
    while (!_parent.row) {
      _parent = _parent.$parent;
      if (!_parent) {
        return;
      }
    }
    return _parent.row;
  },

  checkOrder: function (sos) {
    var me = this;
    var postData = {};
    postData.models = JSON.stringify(me._temp);
    postData.clazz = "com.xyy.erp.platform.common.func.CheckOrder";
    var result = abstractDirective.ajax("POST", "/bill/data/func?" + $.param(postData), null);
    return result;
  },

  orderFunc: function (type, key, name) {
    var me = this;
    var postData = {};
    postData.clazz = "com.xyy.erp.platform.common.func.OrderFunc";
    postData.models = JSON.stringify([{type: type, key: key, name: name}]);
    var result = abstractDirective.ajax("POST", "/bill/data/func?" + $.param(postData), null);
    return result;
  },
  OnlineFunc: function (type, tableName, onlineid) {
    var me = this;
    var postData = {};
    postData.clazz = "com.xyy.erp.platform.common.func.OnlineFunc";
    postData.models = JSON.stringify([{type: type, tableName: tableName, onlineid: onlineid}]);
    var result = abstractDirective.ajax("POST", "/bill/data/func?" + $.param(postData), null);
    return result;
  },
  XSCXFunc: function (cos) {
    var me = this;
    var postData = {};
    postData.clazz = "com.xyy.erp.platform.common.func.XSCXFunc";
    postData.models = JSON.stringify([{type: cos.danjuleixing, danjubianhao: cos.danjubianhao}]);
    var result = abstractDirective.ajax("POST", "/bill/data/func?" + $.param(postData), null);
    return result;
  },
  revertOrder: function (danjubianhao) {
    var me = this;
    var postData = {};
    postData.clazz = "com.xyy.erp.platform.common.func.RevertOrder";
    postData.models = JSON.stringify([{danjubianhao: danjubianhao}]);
    var result = abstractDirective.ajax("POST", "/bill/data/func?" + $.param(postData), null);
    return result;
  },
  cancelOrder: function (danjubianhao) {
    var me = this;
    var postData = {};
    postData.clazz = "com.xyy.erp.platform.common.func.CancelOrder";
    postData.models = JSON.stringify([{danjubianhao: danjubianhao}]);
    var result = abstractDirective.ajax("POST", "/bill/data/func?" + $.param(postData), null);
    return result;
  },

  cancelError: function (danjubianhao) {
    var me = this;
    var postData = {};
    postData.clazz = "com.xyy.erp.platform.common.func.CancelError";
    postData.models = JSON.stringify([{danjubianhao: danjubianhao}]);
    var result = abstractDirective.ajax("POST", "/bill/data/func?" + $.param(postData), null);
    return result;
  },
  YHPZFunc: function (type) {
    var me = this;
    var postData = {};
    postData.clazz = "com.xyy.erp.platform.common.func.YHPZFunc";
    postData.models = JSON.stringify([{type: type}]);
    var result = abstractDirective.ajax("POST", "/bill/data/func?" + $.param(postData), null);
    return result;
  },
  zhujimaFunc: function (name) {
    var me = this;
    var postData = {};
    postData.clazz = "com.xyy.erp.platform.common.func.ZhujimaFunc";
    postData.models = JSON.stringify([{name: name}]);
    var result = abstractDirective.ajax("POST", "/bill/data/func?" + $.param(postData), null);
    return result;
  },

  update: function (tableName, sos, type) {
    var me = this;
    var postData = {};
    postData.tableName = tableName;
    postData.type = type;
    postData.biLLKey = me.$parent._env.billkey;
    postData.models = JSON.stringify(sos);
    postData.clazz = "com.xyy.erp.platform.common.func.UpdateFunc";
    var result = abstractDirective.ajax("POST", "/bill/data/SqlFunc?" + $.param(postData), null);
    return result;
  },

  updateSet: function (tableName, sos, updateKeySet, type, billType) {
    var me = this;
    var postData = {};
    postData.tableName = tableName;
    postData.type = type;
    postData.billType = billType;
    postData.biLLKey = me.$parent._env.billkey;
    for (var o in sos) {
      for (var index in updateKeySet) {
        sos[o][updateKeySet[index].key] = updateKeySet[index].value;
      }
    }
    postData.models = JSON.stringify(sos);
    postData.clazz = "com.xyy.erp.platform.common.func.UpdateFunc";
    var result = abstractDirective.ajax("POST", "/bill/data/SqlFunc?" + $.param(postData), null);
    return result;
  },

  edgeBill: function (sos, ruleKey, tagetURL) {
    var me = this;
    var postData = {};
    postData.ruleKey = ruleKey;
    postData.biLLKey = me.$parent._env.billkey;
    var sourceBillIDs = [];
    $.each(sos, function (index, entry) {
      if (entry.status < 40) {
        result = true;
        return false;
      }
      sourceBillIDs.push(entry.BillID);
    });
    postData.sourceBillIDs = angular.toJson(sourceBillIDs);
    var result = abstractDirective.ajax("POST", "/bill/data/edgeBill?" + $.param(postData), null);
    result.then(function (ret) {
      alert("转换成功.");
      window.parent.location.href = tagetURL;

    });
  },


  MIDService: function (code) {
    var result = abstractDirective.ajax("POST", "/spe/route/sqlService?code=" + code, null);
    return result;
  },


  sum: function (entityKey, col) {
    var $parentScope = _$util.getParent(this).scope;
    var total = 0;
    if ($parentScope._model && $parentScope._model[entityKey]) {
      var rows = $parentScope._model[entityKey].cos;
      for (var i = 0; i < rows.length; i++) {
        total += parseInt(rows[i][col] * 10000);
      }
    }
    var _total = total / 10000;
    return _total;
  },

  //获取模型的值
  getValue: function () {
    if (this.ngModel) {
      return this.ngModel.$modelValue;//返回模型中的值
    } else {
      return undefined;
    }
  },

  setEnvModel: function (model) {
    var _parent = _$util.getParent(this).scope;
    var _model = eval(model);
    clone(model, _parent._env);
  },
  setEnvToCache: function (model) {
    var model = JSON.stringify(model);
    window.localStorage.setItem('cacheEnv', model);
  },
  getEnvFromCache: function () {
    var _model = JSON.parse(window.localStorage.getItem('cacheEnv'));
    var _parent = _$util.getParent(this).scope;
    clone(_model, _parent._env);
    window.localStorage.clear('cacheEnv');
  },
  //设置模型的值
  setValue: function (value) {
    if (this.ngModel) {
      this.ngModel.$setViewValue(value);
      this.ngModel.$render();
    }
  },
  setHide: function () {
    angular.element("[key=" + this.key + "]").hide();
  },
  setShow: function () {
    angular.element("[key=" + this.key + "]").show();
  },
  setDisable: function () {
    angular.element("[key=" + this.key + "]").attr('disabled', 'disabled');
    angular.element("[key=" + this.key + "]").addClass('disabled');
  },
  setEnable: function () {
    angular.element("[key=" + this.key + "]").attr('disabled', false);
    angular.element("[key=" + this.key + "]").removeAttr("readonly");
    angular.element("[key=" + this.key + "]").removeClass('disabled');
  },
  setAllDisable: function () {
    $('body').find('input,button,textarea,select').attr('disabled', 'disabled');
  },
  setAllEnable: function () {
    $('body').find('input,button,textarea,select').attr('disabled', false);
  },
  getRealName: function () {
    return _$util.getParent(this).scope._env.user.realName;
  },
  getOrgId: function () {
    return _$util.getParent(this).scope._env.user.orgId;
  },
  insertRows: function (tableKey, sos) {
    console.log(_$util.getParent(this).scope);
    _$util.getParent(this).scope._model[tableKey].cos.push(sos);
  },
  getBodyRows: function (billKey, tbKey, modelKey, row, multiKey) {
    var me = this;
    debugger;
    multiKey = BASE64.encoder(multiKey);
    // jQuery.post(url,data,success(data, textStatus, jqXHR),dataType)
    $.post("/bill/data/multi-select", {
      BillID: row.BillID,
      tbKey: tbKey,
      billKey: billKey,
      multiKey: multiKey
    }, function (result) {
      var _cos = result.data[modelKey].cos;
      for (var i = 0; i < _cos.length; i++) {
        _$util.getParent(me).scope._model[tbKey].cos.push(_cos[i]);
      }
    });

  },

  ajax: function (method, url, data) {
    var request = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          if (request.status === 200) {
            resolve(request.responseText);
          } else {
            reject(request.status);
          }
        }
      };
      request.open(method, url);
      request.send(data);
    });
  },


  //接受其他指令的事件调用
  __initInstrctonMethodCallback: function () {
    var me = this;
    //事件：$_INSTRUCTION_METHOD_CALLBACK
    this.$on('$_INSTRUCTION_METHOD_CALLBACK', function (e, param) {
      /**
       *
       * 监听事件，可以监听的条件
       * (1)key相同，鉴别接受这是否匹配
       * (2)renderId:代表一次视图渲染变量
       * (2)单据载体是否显示还有其他中继接受者，如果有，则消息需要向下级接受者中继后处理，
       *     一直到末端接受者
       *
       */
      if (param.data.key == me.key && me.renderid == param.data.renderid && param.data.body.indexOf("@") == -1) {//
        try {
          var result = null;
          if (param.data.params && param.data.params[0] == "") {
            result = me[param.data.method].apply(me);
          } else {
            result = me[param.data.method].apply(me, param.data.params);//参数处理
          }

          if (result) {
            param.data.deferred.resolve(result);
          } else {
            param.data.deferred.resolve("");
          }
        }
        catch (err) {
          param.data.deferred.reject(param.data.method + "  not found.");
        }
        //删除消息
        _$util.getCDCache(me).delQueue(param);
      }
    });
  },

  /**
   * 解析函数
   * var func="@mykey.service(1, 2,3);var test='hello';@mykey.@mykey1.@mykey.send(1,test);"
   * var widget_call = func.match(/(@[a-zA-z0-9_.]+)*\([a-zA-z0-9_.,\s\"\']*\)\s*;/g);
   * @param func
   * @returns {*}
   */
  __resolve: function (func) {
    //解析调用格式,如：var func="@mykey.service(1, 2,3);var test='hello';@mykey.@mykey1.@mykey.send(1,test);"
    func = "var $this=this;" + func;
    var widget_call = func.match(/(@[\w.$&]+)+\(.*?\)\s*;/g);
    if (widget_call) {
      for (var i = 0; i < widget_call.length; i++) {
        try {
          func = this.__processFunc(func, widget_call[i]);
        } catch (err) {
          alert(func + " 解析失败，请检查业务脚本");
        }
      }
    }
    return func;
  },

  /**
   * 解析函数
   * @param func
   *          需要处理的函数
   * @param resolover
   *          序号解析的部分
   *          格式为：@widget_key_uuid.function();
   *                  @view_key.@widget_key.send();
   */
  __processFunc: function (func, callFunc) {
    //this.$emit('$_INSTRUCTION_METHOD_CALL', {key:w_shengqingdengji,method:loadDataSource,params:[],body:"消息体"});
    var key = callFunc.substring(1, callFunc.indexOf("."));//消息key，即消息的接受者
    //分析方法名称--就是消息本体
    var method = callFunc.substring(this.__getMethodIndex(callFunc), callFunc.indexOf("("));
    //消息参数
    var params = callFunc.substring(callFunc.indexOf("(") + 1, callFunc.indexOf(")")).split(",");
    var body = this.__getMessageBody(callFunc, key);//消息体:消息-@接受者
    //解析参数，参数可以为变量，常量值，不能为函数调用
    var refCallProxyFunc = "$this.__refCallProxy('$_INSTRUCTION_METHOD_CALL'," + JSON.stringify({
      key: key,
      method: method,
      body: body,
      params: "$$$",
      renderid: this.renderid
    }) + ");"
    var param_array_str = "[";
    for (var i = 0; i < params.length; i++) {
      param_array_str = param_array_str + params[i] + ",";
    }
    var param_array_str = param_array_str + "'']";
    refCallProxyFunc = refCallProxyFunc.replace("\"$$$\"", param_array_str);
    func = func.replace(callFunc, refCallProxyFunc);
    return func;
  },


  //消息体:消息-@接受者
  __getMessageBody: function (callFunc, receiver) {
    return callFunc.substring(receiver.length + 2);//.和@占用一个位置，故这里加上2
  },

  __getMethodIndex: function (callFunc) {
    var lastAt = callFunc.lastIndexOf("@");
    var methodIndex = -1;
    for (var i = lastAt; i < callFunc.length; i++) {
      if (callFunc[i] == ".") {
        methodIndex = i + 1;
        break;
      }
    }
    return methodIndex;
  },

  /**
   * 回调函数代理
   * @param event
   * @param data
   * @returns {deferred.promise|{then, catch, finally}}
   * @private
   */
  __refCallProxy: function (event, data) {
    var deferred = this.$q.defer();//创建一个deferred对象
    var promise = deferred.promise;
    data.deferred = deferred;
    this.$emit(event, data);
    return promise;//defer.promise用于返回一个promise对象
  },

  /**
   * 初始化触发器代码
   * @private
   */
  __initTriggers: function () {
    if (!(this.triggers == null || this.triggers == "")) {
      var fun_str = BASE64.decoder(this.triggers);
      //分析脚本中@调用
      try {
        var fun_def = JSON.parse(fun_str);
        for (var i = 0; i < fun_def.length; i++) {
          if (!this.triggerFuns) {
            this.triggerFuns = [];//触发器数组
          }
          var trigger = this.__resolve(fun_def[i]);
          this.triggerFuns.push(new Function('scope', trigger));
        }
      } catch (error) {
        alert(this.key + " 触发器语法错误，请核对.");
      }

    }
  },

  /**
   * 初始器代码
   * @private
   */
  __initInit: function () {
    //发送修改广播
    //this.$broadcast('$_MODEL_CHANGE_$', this._model);
    var me = this;
    me.$on('$_MODEL_CHANGE_$', function () {
      if (!me._$status || me._$status != "loaded") {
        //控件初始化-init,控件初始化动作；
        if (!(me.init == null || me.init == "")) {
          var fun_str = BASE64.decoder(me.init);
          //分析脚本中@调用
          var func = me.__resolve(fun_str);
          try {
            var fun = new Function('scope', func);//构造函数体
            //在当前scope范围类执行
            fun.apply(me);
          } catch (err) {
            alert(fun_str + " 动态构建函数失败");
          }
          me._$status = "loaded";
        }
      }
    });


  },
  __initPopwin: function () {
    //发送修改广播
    //this.$broadcast('$_MODEL_CHANGE_$', this._model);
    var me = this;

    if (!me._$status || me._$status != "loaded") {
      //控件初始化-init,控件初始化动作；
      if (!(me.init == null || me.init == "")) {
        var fun_str = BASE64.decoder(me.init);
        //分析脚本中@调用
        var func = me.__resolve(fun_str);
        try {
          var fun = new Function('scope', func);//构造函数体
          //在当前scope范围类执行
          fun.apply(me);
        } catch (err) {
          alert(fun_str + " 动态构建函数失败");
        }
        me._$status = "loaded";
      }
    }


  },


  /**
   * CheckRules代码
   * @private
   */
  __initCheckRules: function () {
    //初始化checkrule
    //1、type：1.1、内置验证规则  builtin
    //          1.2、正则表达式   regular
    //2、rule：内置规则或者正则表达式
    //3、msg：输出的错误信息
    //{"type":"builtin","rule":"email","msg":"请输入正确信息"}

    var me = this;
    var _parent = _$util.getParent(this).scope;

    //内置常用验证规则
    var notNull = /[\w\W]+/,
      len616 = /^[\w\W]{6,16}$/,
      num = /^\d+$/,
      num616 = /^\d{6,16}$/,
      cn = /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]+$/,
      cn618 = /^[\u4E00-\u9FA5\uf900-\ufa2d\w\.\s]{6,18}$/,
      postCode = /^[0-9]{6}$/,
      mobile = /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$/,
      tel = /^0\d{2,3}-?\d{7,8}(-\d{1,6})?$/,
      telAndMobile = /(^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|18[0-9]{9}$|17[0-9]{9}$)|(^0\d{2,3}-?\d{7,8}(-\d{1,6})?$)/,
      email = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
      url = /^(\w+:\/\/)?\w+(\.\w+)+.*$/,
      idCard = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
      bankCard = /^(\d{16}|\d{19})$/;

    _parent.errList = [];
    // _parent.checkRuleLists=[];
    var element = angular.element("[key=" + me.key + "]");
    if (!_parent.checkRuleLists) {
      _parent.checkRuleLists = [];
    }
    ;
    // 模拟验证数据
    // me.rules={"type":"builtin","rule":'idCard',"msg":"请输入真实的身份证号码"};
    if (!(me.checkrules == null || me.checkrules == "")) {
      var rules = BASE64.decoder(me.checkrules);
      var _rules = eval(rules);
      _parent.checkRuleLists.push({
        key: me.key,
        rule: _rules
      });

      var _rule = eval(_rules[0].rule);

      var _err = {
        key: me.key,
        err: _rules[0].msg,
        rule: _rule
      };

      //验证；
      if (me.ngModel) {
        me.ngModel.$viewChangeListeners.push(
          function () {
            checkRules(_err);
          }
        );
      }
      ;

      element.on('focus', function () {
        checkRules(_err);
      });

      element.on('blur', function () {
        // element.removeClass("isError");
        // element.popover('hide');
      });
    } else if (me.required && (!me.checkrules || me.checkrules == "")) {
      var rules = [{"type": "builtin", "rule": notNull, "msg": "请输入带*的必填项！"}];
      _parent.checkRuleLists.push({
        key: me.key,
        rule: rules
      });
      var _err = {
        key: me.key,
        err: rules[0].msg,
        rule: rules[0].rule
      };
      if (me.ngModel) {
        me.ngModel.$viewChangeListeners.push(
          function () {
            checkRules(_err);
          }
        );
      }
      ;

      element.on('focus', function () {
        checkRules(_err);
      });
    }
    ;

    //    验证方法
    function checkRules(_err) {
      var _elm = $("[key=" + me.key + "]");
      if ((me.ngModel && _err.rule.test(me.ngModel.$viewValue) == false) || me.ngModel.$viewValue == undefined) {
        _elm.addClass("isError");
        _elm.attr("data-content", _err.err);
        _elm.attr("data-placement", "auto bottom");
        _elm.attr("data-container", "body");
        _elm.attr("data-original-title", "");
        _elm.attr("data-trigger", "focus");
        _elm.popover('show');
        if (!checkIn(_err)) {
          _parent.errList.push(_err);
        }
        ;
      } else {
        _elm.removeClass("isError");
        _elm.popover('destroy');
        delErr(_err);
      }
    };

    function checkIn(_err) {
      var i = _parent.errList.length;
      while (i--) {
        if (_parent.errList[i].key == _err.key) {
          return true;
        }
      }
      return false;
    };

    function delErr(_err) {
      var i = _parent.errList.length;
      while (i--) {
        if (_parent.errList[i].key == _err.key) {
          _parent.errList.splice(i, 1);
        }
      }
    }

  },

  /**
   * 格式器代码
   * @private
   */
  __initFormatters: function (input, formula) {
    var me = this;
    var _addressFormat;
    var _selectFormat;
    //格式化器代码
    if (formula) {
      for (var j = 0; j < input.length; j++) {
        input[j].shadowObj = {};
        for (var i = 0; i < formula.length; i++) {
          if (formula[i].formatter) {
            var __formatter = window.BASE64.decoder(formula[i].formatter);
            __formatter = eval(__formatter);
            var _arr = eval("(" + __formatter[0].formatExpr + ")");
            var _type = _arr[0].type;
            var _getType = _arr[0].local;
            if (_getType) {
              //本地格式化，数据集写在xml中
              for (var f = 0; f < _arr[0].url.length; f++) {
                if (input[j][formula[i].key] == _arr[0].url[f].value) {
                  input[j].shadowObj[formula[i].key] = _arr[0].url[f].name;
                }
              }
            } else {
              //该分支格式化省市区
              if (_type && _type == 'addressFormat') {
                if (_addressFormat && _addressFormat.length > 0) {
                  $.each(_addressFormat, function (k, item) {
                    if (item.areaCode == input[j][formula[i].key]) {
                      input[j].shadowObj[formula[i].key] = item.areaName;
                    }
                  })
                } else {
                  $.ajax({
                    url: "/lib/file/addressFormat.json",//json文件位置
                    type: "GET",//请求方式为get
                    dataType: "json", //返回数据格式为json
                    async: false,
                    success: function (data) {//请求成功完成后要执行的方法
                      //each循环 使用$.each方法遍历返回的数据date
                      if (data && data.length == 0) {
                        alert("格式化数据集加载错误！");
                        return;
                      } else {
                        _addressFormat = data;
                      }
                      ;
                      $.each(data, function (k, item) {
                        if (item.areaCode == input[j][formula[i].key]) {
                          input[j].shadowObj[formula[i].key] = item.areaName;
                        }
                      })
                    }
                  });
                }

              } else {
                // 实际格式化方法
                function realFormatter(data){
                  if (data && data.length > 0) {
                    for(var l=0;l<data.length;l++){
                      if(data[l].k==input[j][formula[i].key]){
                        input[j].shadowObj[formula[i].key] = data[l].v;
                      }
                    }
                  } else {
                    input[j].shadowObj[formula[i].key] = input[j][formula[i].key];
                  }
                }
                //
                if (_arr && _arr[0].url) {
                  var _src = baseUrl+"/"+_arr[0].url;
                  var _dataType = _arr[0].dataType;
                  var _billkey = window.$env.billkey;
                  var _cacheSelect = window.sessionStorage.getItem(_billkey + '-' + _type);
                  if (_cacheSelect && _cacheSelect !== '') {
                    realFormatter(JSON.parse(_cacheSelect));
                  } else {
                    if (_dataType) {
                      //区分字典和bills
                      var _shadowV = $.ajax({
                        // baseUrl+"/"+_src+"?isMobile=true&userInformation="+userInfo
                        // url: _src + "?type=" + _type + "&key=" + input[j][formula[i].key] + "&dataType=" + _dataType,
                        url: _src + "?type=" + _type  + "&dataType=" + _dataType+"&isMobile=true&userInformation="+userInfo,
                        async: false
                      });
                    } else {
                      var _shadowV = $.ajax({
                        // url: _src + "?type=" + _type + "&key=" + input[j][formula[i].key],
                        url: _src + "?type=" + _type+"&isMobile=true&userInformation="+userInfo,
                        async: false
                      });
                    }

                    if (_shadowV.responseText && _shadowV.responseText !== '') {
                      var _shadowValue = eval("(" + _shadowV.responseText + ")");
                      window.sessionStorage.setItem(_billkey + '-' + _type, JSON.stringify(_shadowValue.data));
                      realFormatter(_shadowValue.data);
                    }
                  }

                  //传src进来的分支end
                } else {
                  //普通通用格式化action
                  if (_selectFormat ) {
                    var _data = _selectFormat[_type];
                    if (!_data || _data.length == 0) {
                      alert("格式化数据集加载错误！");
                      return;
                    }
                    $.each(_data, function (k, item) {
                      if (input[j][formula[i].key] == item.key) {
                        input[j].shadowObj[formula[i].key] = item.value;
                      }
                    })
                  } else {
                    $.ajax({
                      // baseUrl+"/"+_src+"?isMobile=true&userInformation="+userInfo
                      url: baseUrl+"/lib/file/selectFormat.json?isMobile=true&userInformation="+userInfo,//json文件位置
                      type: "GET",//请求方式为get
                      dataType: "json", //返回数据格式为json
                      async: false,
                      success: function (data) {//请求成功完成后要执行的方法
                        //each循环 使用$.each方法遍历返回的数据date
                        _selectFormat = data;
                        var _data = data[_type];
                        if (!_data || _data.length == 0) {
                          alert("格式化数据集加载错误！");
                          return;
                        }
                        ;
                        $.each(_data, function (k, item) {
                          if (input[j][formula[i].key] == item.key) {
                            input[j].shadowObj[formula[i].key] = item.value;
                          }
                        })
                      }
                    });
                  }
                }
              }
              //

            }

          } else {
            input[j].shadowObj[formula[i].key] = input[j][formula[i].key];
          }
        }
      }
      return input;
    } else {
      return input;
    }
  },
  /**
   * 初始化属性代码
   * @private
   */
  __initProperties: function () {

  },

  __initTriggerWatcher: function () {
    var me = this;
    var _watch = function () {//trigger代码
      if (me.triggerFuns) {
        for (var i = 0; i < me.triggerFuns.length; i++) {
          me.triggerFuns[i].apply(me);
        }
      }
    };

    if (me.ngModel) {
      me.ngModel.$viewChangeListeners.push(
        _watch
      );
    }

  },
  __initOnClickHandlerWatcher: function () {
    var me = this;
    if (!(me.onClickHandler == null || me.onClickHandler == "")) {
      var fun_str = BASE64.decoder(me.onClickHandler);
      //分析脚本中@调用
      try {
        var fun_def = JSON.parse(fun_str);
        for (var i = 0; i < fun_def.length; i++) {
          if (!me.onclickFuns) {
            me.onclickFuns = [];//触发器数组
          }
          var trigger = me.__resolve(fun_def[i]);
          me.onclickFuns.clear();
          me.onclickFuns.push(new Function('scope', trigger));
        }
      } catch (error) {
        alert(me.key + " 单击事件语法错误，请核对.");
      }
    }
    ;
  },

  $execute: function () {
    this.__initInstrctonMethodCallback();
    this.__initProperties();
    this.__initInit();
    this.__initTriggers();
    this.__initCheckRules();
    this.__initFormatters();
    this.__initTriggerWatcher();
    this.__initOnClickHandlerWatcher();
  },

  $executePopup: function () {
    this.__initInstrctonMethodCallback();
    this.__initProperties();
    // this.__initInit();
    this.__initTriggers();
    this.__initCheckRules();
    this.__initFormatters();
    // this.__initTriggerWatcher();
    this.__initOnClickHandlerWatcher();
  }
};

//模型服务
myDirectiveModule.factory("modeService", ['$http', function ($http) {
  //模型初始化
  var modeInit = function (postData) {
    return $http.post(baseUrl + "/bill/data?isMobile=true&userInformation="+userInfo,
      $.param(postData),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }
    )
  };

  return {
    modeInit: function (postData) {
      return modeInit(postData);
    }

  }
}]);

//select的数据源服务
myDirectiveModule.factory("selectDSService", ['$http', function ($http) {
  //加载数据源datasource
  /**
   * datasource:{datasource:{type:remote|internal,value:"" or [{key:value,key:value}]}}
   * @param datasource
   * @returns {HttpPromise}
   *
   */
  var load = function (datasource) {
    if (datasource.type == "remote") {
      return $http.post(baseUrl + "/bill/data?isMobile=true&userInformation="+userInfo,
        $.param(postData),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        }
      ).sucess(function (data) {
        datasource.value = data;
      }).error(function (data) {
        alert('selectDSService……'+data);
      });
    } else if (datasource.type == "internal") {//内部数据源
      if (!(datasource.value instanceof Array)) {
        alert("内部数据源错误");
      }
    } else {
      alert("不支持的datasource格式");
    }

  };


  return {
    load: function (datasource) {
      return load(datasource);
    }

  }
}]);


//通用  注入js&css链接到head部分方法
myDirectiveModule.factory('Common', [
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
]);


/**
 *    billuiview指令
 */
/*myDirectiveModule.directive('billuiview', function ($http, $compile) {
  return {
    restrict: "EA",
    scope: {
      src: "@",
      renderid: "@",

    },
    //控制
    controller: function ($scope, $element, $attrs, $transclude) {

    },
    link: function (scope, element, attrs, ngModel) {
      scope.$emit("__$_view_created__$__", {scope: scope});
      //视图标志
      scope._$$view$$ = "_$$view$$";
      //寻找我的父
      var parent = _$util.getParent(scope);
      if (!parent.scope._model) {
        alert("view的父模型构建不完整.");
      }
      scope._model = new $Model(parent.scope._model);//构建视图的数据模型
      scope._env = new $Env(parent.scope._env); // 构建视图的环境
      scope.viewInit = function () {
        scope.loadDataSet();
      };
      scope.bindModel = function (data) {
        if (!data) {
          return;
        }
        for (var i = 0; i < data._models.length; i++) {
          var dataObject = data[data._models[i]];
          scope._model[data._models[i]] = dataObject;
          dataObject.co = dataObject.cos[0];
          dataObject.sos = [];
          dataObject.dels = [];
          if (dataObject.head) {
            scope[data._models[i]] = dataObject.co;
            scope["$" + data._models[i]] = dataObject;
          } else {
            scope["__$" + data._models[i] + "$__"] == dataObject.cos;
            scope["$" + data._models[i]] = dataObject;
          }
        }
      };
      /!**
       * @param data
       *!/
      scope.loadDataSet = function () {
        var req = {};
        clone(scope._env, req);
        $http.post(baseUrl+"/bill/data/viewport?isMobile=true&userInformation="+userInfo, $.param(req),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
          }).success(function (data) {
          if (data.status == 0) {//action执行异常
            alert('billuiview………'+data.error);
          } else if (data.status == 1) {//正常返回数据
            if (data.data) {
              scope.bindModel(data.data);
              //发送修改广播，把私有模型的变化传递下去
              scope.$broadcast('$_MODEL_CHANGE_$', scope._model);
            }
          } else if (data.status == 2) {//正常返回，但没有数据
            console.log("no data.")
          } else {
            alert("billuiview--" + scope.key + "未知异常");
          }
        }).error(function (err) {
          console.log(err);
        });
      };
      /!**
       * 接受上级传递的模型修改广播，重新绑定
       *!/
      scope.$on('$_MODEL_CHANGE_$', function (e, model) {
        scope.bindModel();
      });

      //事件：$_INSTRUCTION_METHOD_CALLBACK
      scope.$on('$_INSTRUCTION_METHOD_CALLBACK', function (e, param) {
        //发送给我的消息
        if (param.data.key == attrs.key && scope.renderid == param.data.renderid && param.data.body.indexOf("@") == -1) {
          try {
            var result = null;
            if (param.data.params && param.data.params[0] == "") {
              result = scope[param.data.method].apply(scope);
            } else {
              result = me[param.data.method].apply(scope, param.data.params);//参数处理
            }
            if (result) {
              param.data.deferred.resolve(result);
            } else {
              param.data.deferred.resolve("");
            }
          } catch (err) {
            param.data.deferred.reject(param.data.method + "  not found.");
          }
          //删除消息
          _$util.getCDCache(me).delQueue(param);
        } else if (param.data.key == attrs.key && scope.renderid == param.data.renderid && param.data.body.indexOf("@") == 0) {
          /!*我需要中继处理的消息,处理操序列如下：
           (1)renderid换为subrenderid
           (2)key替换为subkey
           (3)body中去掉@**.内容，并且**==key
           *!/
          if (scope.subrenderid) {
            var subkey = _getSubKeyFromMessageBody(param.data.body);
            param.data.key = subkey;
            param.data.body = param.data.body.substring(subkey.length + 2);
            param.data.renderid = scope.subrenderid;
          }
        }
      });

      var _getSubKeyFromMessageBody = function (mbody) {
        return mbody.substring(1, mbody.indexOf("."));
      }
      scope.url = baseUrl+"/bill/view/viewport?billKey=" + scope.src+"&isMobile=true&userInformation="+userInfo;
      //请求
      scope.requestUrl = function (url) {
        $http.post(scope.url).success(function (responseData) {
          scope.subrenderid = responseData.renderid;//子渲染id
          var env = responseData.env;
          clone(env, scope._env);
          var el = $compile(responseData.html)(scope);//编译，这里需要获取视图的，当时视图需要获取自己的渲染id
          element.append(el);
          //$("#aa").append(el);
          scope.viewInit();
        }).error(function (data, status, headers, config) {
          alert("请求视图：" + data);
        });
      };
      //请求数据
      scope.requestUrl(scope.url);

    }
  }
});


// billuirichtext  富文本编辑器
// 调用方法，  <div id="editor" billuirichtext ng-model=""></div>
myDirectiveModule.directive('billuirichtext', function (Common, $rootScope, $http, $q) {
  return {
    restrict: 'EA',
    require: '?ngModel',
    scope: {
      options: "=", // = 对象，@字符串，&方法
      bound: "@",//
      triggers: "@",
      checkRules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@",
    },
    link: function (scope, ele, attrs, ctrl) {
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      // $rootScope.$emit('loading', '初始化编辑器...');//广播loading事件，可以删除
      var _self = this,
        _initContent,
        editor,
        editorReady = false,
        base = 'lib/ueditor', //ueditor目录
        _id = attrs.ueditor;
      var editorHandler = {
        init: function () {
          window.UEDITOR_HOME_URL = base + '/';
          var _self = this;
          if (typeof UE != 'undefined') {
            editor = UE.getEditor(_id, {
              toolbars: [
                [
                  'fullscreen', 'source', '|', 'undo', 'redo', '|',
                  'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
                  'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
                  'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
                  'directionalityltr', 'directionalityrtl', 'indent', '|',
                  'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
                  'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
                  'simpleupload', 'insertimage', 'emotion', 'scrawl', 'insertvideo', 'music', 'attachment', 'map', 'gmap', 'insertframe', 'insertcode', 'pagebreak', 'template', 'background', '|',
                  'horizontal', 'date', 'time', 'spechars', 'wordimage', '|',
                  'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|',
                  'print', 'preview', 'searchreplace', 'drafts'
                ]
              ]
            });

            editor.ready(function () {
              editor.setHeight(800);
              // $rootScope.$emit('loading', '');//编辑器初始化完成
              editor.addListener('contentChange', function () {//双向绑定
                if (!scope.$$phase) {
                  scope.$apply(function () {
                    ctrl.$setViewValue(editor.getContent());
                  });
                }
              });
            });
          }
          else {
            Common.loadScript(base + '/ueditor.config.js', null);
            Common.loadScript(base + '/ueditor.all.min.js', function () {
              _self.init();
            });
          }
        },
        setContent: function (content) {
          var _render = function () {
            if (editor && content) {
              editor.setContent(content);
            }
          }
          window.setTimeout(_render, 500);
        }
      };
      ctrl.$render = function () {
        _initContent = ctrl.$isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue;
        editorHandler.setContent(_initContent);//双向绑定
      };
      editorHandler.init();

      //事件
      $rootScope.$on('$routeChangeStart', function () {
        editor && editor.destroy();
      });
      $rootScope.resetContent = function () {
        ctrl.$setViewValue("");
      };
      scope.$execute();
    }
  }
});

// 图形
// <div chart class="echart" ec-config="lineConfig" ec-option="lineOption" ></div>
myDirectiveModule.directive("billuichart", function ($http,$q,Common) {
  return {
    scope: {
      bound: "@",//
      triggers: "@",
      checkRules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@",
      datatablekey:"@",
      charttype:"@",
      axis:"@",
      series:"@",
      legend:"@",
      grouptype:"@",
      groudby:"@",

      float:"@",
      toolbox:"@",
      tooltip:"@",
      title:"@",
      datasettype:"@"
    },
    restrict: "EA",
    link: function(scope,element,attrs,ngModel) {
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$execute();
      var _parentScope = _$util.getParent(scope).scope;
      var req = {};
      clone(_parentScope._env, req);
      if(!scope.datatablekey || scope.datatablekey==""){
        alert("dataTableKey 不存在！");
        return;
      };
      scope.allModel=_parentScope._model[scope.datatablekey];
      req.datasettype=scope.datasettype;
      req.datatablekey=scope.datatablekey;
      req.charttype=scope.charttype;
      req.axis=scope.axis;
      req.series=scope.series;
      req.legend=scope.legend;
      req.grouptype=scope.grouptype;
      req.groudby=scope.groudby;
      req.model=scope.allModel;
      //判断是否从页面内取模型，如果从页面内取模型，则执行watch
      if(scope.datasettype=="model"){
        scope.$watch(scope.allModel, function (newValue, oldValue) {
          scope.loadDataSource();
        });
      };

      scope.loadDataSource=function () {
        if (typeof echarts != 'undefined') {
          scope.initCharts();
        } else {
          try {
            Common.loadScript('/lib/js/echarts/echarts.min.js', function () {
              scope.initCharts();
            });
          } catch (e) {
            alert('charts资源没有正确加载！')
          }
        }
      };

      scope.initCharts=function () {
        $http.post(baseUrl + "/bill/data/charts?isMobile=true&userInformation="+userInfo, $.param(req), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        }).success(function (data) {
          if(scope.charttype=="GenerialChart"){
            scope.option={
              title: {
                text: scope.title
              },
              tooltip: {
                show:scope.tooltip,
              },

              legend: {
                data:['销量']
              },
              xAxis: {
                type:'category',
                data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"],
              },
              yAxis: {},
              series: [{
                name: '销量',
                type: 'line',
                data: [5, 2, 36, 10, 10, 20]
              },{
                name: '价格',
                type: 'bar',
                data: [15, 20, 36, 10, 10, 20]
              }]
            };
          }
          var myChart = echarts.init(element[0]);
          myChart.setOption(scope.option);


        }).error(function (err) {
          console.log(err);
        });
      };

    },

  }
});


// 树 billuitree
myDirectiveModule.directive('billuitree', function ($http, $q, Common) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    // template: "<div class=\"ztree\" treemodel=\"treemodel\" treeoptions=\"treeoptions\" ></div>",
    scope: {
      bound: "@",//
      triggers: "@",
      checkRules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@",
      tableKey: "@",
      treeoptions: "=",
      treemodel: "=",
      multiselect: "@",
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用

      scope._$curTreeNode = null;
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      ////树节点click的时候抛出事件以及当前节点
      scope.zTreeOnClick = function (event, treeId, treeNode) {
        var parent = _$util.getParent(scope);
        if (!parent.scope._model) {
          alert("Tree父模型构建不完整.");
        }
        var entityKey = "$t_" + scope.tableKey;
        var _treeNode = scope.tree.getSelectedNodes();
        scope.$apply(function () {
          //将当前选中的节点放到ngModel中，控制器中直接取当前的ngModel
          if (!scope._$curTreeNode || scope._$curTreeNode.tId != _treeNode) {
            scope.ngModel.$setViewValue(_treeNode);
            scope._$curTreeNode = _treeNode;
          }

        });
      };
      //删除节点确认，具有子节点的节点禁止删除。
      scope.zTreeBeforeRemove = function (treeId, treeNode) {
        if (treeNode.children && treeNode.children.length > 0) {
          alert('子节点不为空，禁止删除');
          return false;
        } else {
          return confirm("确定删除" + treeNode.name + " ？")
        }
      };
      //重命名节点 回调函数
      scope.zTreeOnRename = function (event, treeId, treeNode, isCancel) {

      };

      //拖拽结束事件
      scope.onDrop = function (event, treeId, treeNodes, targetNode, moveType) {
        var parent = _$util.getParent(scope);
        var entityKey = "$t_" + scope.tableKey;
        parent.scope._model[entityKey] = scope.tree.getNodes();
      };

      //拖拽放下前事件
      scope.beforeDrop = function (treeId, treeNodes, targetNode, moveType) {
        if (moveType == 'inner' && targetNode.nodeType == '2') {
          alert(targetNode.name + '为明细节点，不能移入')
          return false;
        }
      };

      //tree
      //    树默认配置，可在控制器中覆盖默认配置

      scope.treemodel = [];
      //设置是否允许多选
      var _multiselect = false;
      if (attrs.multiselect == 'true') {
        _multiselect = true;
      } else {
        _multiselect = false;
      }
      ;
      scope.treeoptions = {
        view: {
          selectedMulti: _multiselect
        },
        edit: {
          drag: {
            autoExpandTrigger: true,
          },
          enable: true,
          showRemoveBtn: false,
          showRenameBtn: false
        },
        check: {
          enable: false,
          autoCheckTrigger: true,
          chkStyle: "checkbox",
          radioType: "all",    // "level" 时，在每一级节点范围内当做一个分组。radioType = "all" 时，在整棵树范围内当做一个分组。
          chkboxType: {"Y": "ps", "N": "ps"}
        },
        data: {
          simpleData: {
            enable: true
          }
        },
        callback: {
          onClick: scope.zTreeOnClick,
          beforeRemove: scope.zTreeBeforeRemove,
          onRename: scope.zTreeOnRename,
          onDrag: scope.onDrag,
          onDrop: scope.onDrop,
          beforeDrop: scope.beforeDrop,
          onExpand: scope.onExpand

        }
      };


      //递归,初始化的时候回显selected
      function _initSelected(node) {
        // status   :  0 禁用  1可用
        if (node && node.length) {
          // var _tid=node[j].tId;
          // angular.element(_tid).addClass();
          for (var j = 0; j < node.length; j++) {
            scope.setTreeClass(node[j]);
            var _childs = node[j].children;
            if (_childs.length > 0) {
              for (var i = 0; i < _childs.length; i++) {
                _initSelected(_childs[i]);
              }
            }
          }
        } else {
          scope.setTreeClass(node);
          var _childs = node.children;
          if (_childs.length > 0) {
            for (var i = 0; i < _childs.length; i++) {
              _initSelected(_childs[i]);
            }
          }
        }
        //
      };

      scope.setTreeClass = function (node) {
        // 0:草稿  10：启用   20：禁用   30：删除
        var _tid = node.tId + '_a';
        if (node.status == 0) {
          angular.element('#' + _tid).addClass('disabled');
        } else if (node.status == 20) {
          angular.element('#' + _tid).addClass('draft');
        }
      };

      //树初始化
      scope._initTree = function () {
        $.fn.zTree.init(element, scope.treeoptions, scope.treemodel);
        var treeID = attrs.id;
        var _nodes = scope.treemodel;
        scope.tree = $.fn.zTree.getZTreeObj(treeID);
        var __node = scope.tree.getNodes();
        scope.getSelectedNodes = function () {
          return scope.tree.getSelectedNodes();
        };
        scope.getCheckedNodes = function () {
          return scope.tree.getCheckedNodes();
        };
        scope.selectNode = function (node, addFlag, isSilent) {
          return scope.tree.selectNode(node, addFlag, isSilent);
        };
        scope.getNodes = function () {
          return scope.tree.getNodes();
        };
        _initSelected(__node);
      };

      //默认不初始化树，在控制器中进行调用load初始化。
      scope.loadTree = function () {
        if (typeof $.fn.zTree != 'undefined') {
          scope._initTree();
        } else {
          try {
            Common.loadCss('/lib/css/zTreeStyle/zTreeStyle.css', null);
            Common.loadScript('/lib/js/jquery.ztree.all.js', function () {
              scope._initTree();
            });
          } catch (e) {
            alert('树资源没有正确加载！')
          }
        }
      };


      scope.bindRowsModel = function () {
        //寻找父
        var parent = _$util.getParent(scope);
        if (!parent.scope._model) {
          alert("Tree父模型构建不完整.");
        }
        var entityKey = "$t_" + scope.tableKey;
        if (parent.scope._model[entityKey]) {
          if (scope.treemodel && scope.treemodel != parent.scope._model[entityKey]) {
            scope.treemodel = parent.scope._model[entityKey];
            //模型赋值之后进行树初始化
            scope.loadTree();
          }
        }
      };

      scope.$on('$_MODEL_CHANGE_$', function (e, model) {
        scope.bindRowsModel();
      });
      scope.$execute();
    }
  }
});


/!*****************************************************************************
 * *****************************************************************************
 *    billui系列指令
 * *****************************************************************************
 ******************************************************************************!/
/!*
 billuiselect指令
 *!/

myDirectiveModule.directive('billuiselect', function ($http, $q, Common, $timeout, $interval) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    template: "<select ng-options=\"x.value as x.name for x in datasource.value\"></select>",
    // templateUrl: "/Views/_select.html",
    replace: true,
    scope: {
      bound: "@",//
      triggers: "@",
      checkrules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@",
      sourceSrc: "@",
      required: "@"
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.datasource = {
        value: []
      };
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      if (scope.$parent._env && scope.$parent._env.alldisabled) {
        element.attr("disabled", "true");
      };

      scope.$execute();

      //解析property
      scope.clearDataSource = function () {
        scope.datasource.value.clear();
      };

      var _parent = _$util.getParent(scope).scope;
      var _billkey = _parent._env.billkey;
      scope.loadDataSource = function (src) {
        if (src && src !== '') {
          $http.get(baseUrl+"/"+src+"?isMobile=true&userInformation="+userInfo).success(function (result, status, headers, config) {
            var _ds = [];
            var data = result.data;
            if (data && data !== "") {
              for (var i = 0; i < data.length; i++) {
                _ds.push({
                  "name": data[i][attrs.k],
                  "value": data[i][attrs.v]
                });
              }
              ;
              scope.datasource.value.clear();
              scope.datasource.value.addAll(_ds);
            }
          }).error(function (data, status, headers, config) {
            console.log(status);
          });
        } else {
          var _cacheSelect = window.sessionStorage.getItem(_billkey + '-' + scope.key);
          if (_cacheSelect && _cacheSelect !== '') {
            var _ds = JSON.parse(_cacheSelect);
            scope.datasource.value.clear();
            scope.datasource.value.addAll(_ds);
          } else if (scope.sourceSrc && scope.sourceSrc !== "") {
            // var _src = scope.sourceSrc;
            var _arr=scope.sourceSrc.split("=");
            var _type=_arr[1];
            var selType;
            if(scope.sourceSrc.indexOf("selectSrc")>-1){
              var _src = "lib/file/selectFormat.json";
              selType="select";
            }else{
              var _src = scope.sourceSrc;
              selType="getStatus";
            }
            $http.get(baseUrl+"/"+_src+"?isMobile=true&userInformation="+userInfo).success(function (result, status, headers, config) {
              var _ds = [];
              if(selType=="select"){
                var data = result[_type];
              } else if(selType=="getStatus") {
                var data = result.data;
              }
              if (data && data !== '') {
                for (var i = 0; i < data.length; i++) {
                  if(selType=="select"){
                    _ds.push({
                      "name": data[i].value,
                      "value": data[i].key
                    });
                  }else if(selType=="getStatus"){
                    _ds.push({
                      "name": data[i].v,
                      "value": data[i].k
                    });
                  }

                }
                scope.datasource.value.clear();
                scope.datasource.value.addAll(_ds);
                window.sessionStorage.setItem(_billkey + '-' + scope.key, JSON.stringify(_ds));
              }
            }).error(function (data, status, headers, config) {
              console.log(status);
            });

          } else if (scope.properties && scope.properties !== "") {
            //property:{name:"datasource",type:remote|internal,value:"" or {} or []}
            var ds_array = eval(BASE64.decoder(scope.properties));
            for (var i = 0; i < ds_array.length; i++) {
              if (ds_array[i].name == "datasource") {
                scope.datasource.value.clear();
                scope.datasource.value.addAll(ds_array[i].value);
                break;
              }
            }


            if (!scope.datasource) {
              alert("没有正确设置数据源datasource属性，select控件无法工作");
            }

          } else {
            alert("没有设置数据源datasource属性，select控件无法工作");
          }
          ;
          //
        }
      };
      //    移除数据集方法
      scope.removeData = function (data) {
        var _dsl = scope.datasource.value;
        scope._d=data;
        if (!_dsl.length || _dsl.length==0) {
          $timeout(function () {
            scope.removeData(scope._d);
          },1);
        } else {
          scope.realDel(data);
        }
      };

      scope.realDel=function (data) {
        var delVal = data.split(',');
        for (var i = 0; i < scope.datasource.value.length; i++) {
          for (var j = 0; j < delVal.length; j++) {
            if (scope.datasource.value[i].value == parseFloat(delVal[j])) {
              scope.datasource.value.delByValue(scope.datasource.value[i]);
            };
          }
        }
      }
      //
      ngModel.$viewChangeListeners.push(
        function () {
          ngModel.$setViewValue(parseInt(ngModel.$viewValue));
          ngModel.$render();
        }
      );
    }
  }
});
/!*
 billuistring
 *!/

myDirectiveModule.directive('billuistring', function ($http, $q,$compile) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: {
      bound: "@",//
      triggers: "@",
      checkrules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@"
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      var _parent=_$util.getParent(scope).scope;
      if(_parent._env && _parent._env.alldisabled){
        element.attr("disabled","true");
      }
      if(attrs.zhujima==""){
        scope.$executePopup();
        if(scope.properties && scope.properties!==""){
          var ds=eval(BASE64.decoder(scope.properties));
          for(var i=0;i<ds.length;i++){
            if(ds[i].name=="dataTable"){
              var _billKey=ds[i].value;
              break;
            }else{
              var _billKey = "shangpinjibenxinxi";
            }
          }
        }else{
          var _billKey = "shangpinjibenxinxi";
        }

        var el = $compile('<i class="searchIcon glyphicon glyphicon-search" ng-click="searchzjm()"></i>')(scope);
        element.parent().append(el);
        var _parent=_$util.getParent(scope).scope;
        // var _billKey = _parent._env._$parent.billkey;
        //助记码回车事件
        element.keydown(function (event) {
          var myEvent = event || window.event; //解决不同浏览器获取事件对象的差异
          switch (myEvent.keyCode) {
            case 13://delete事件
              scope.searchzjm();
              break;
          }
        });
        scope.searchzjm = function () {
          var req={
            billkey:_billKey,
            params:element.val()
          };
          $http.post(baseUrl + "/bill/data/dic-like?isMobile=true&userInformation="+userInfo, $.param(req), {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
          }).success(function (data) {
            if(data.data && data.data.head!==''){
              scope._zhujimaheads=data.data.head;
              scope._zhujimaBody=data.data.body;
              if(scope._zhujimaBody.length==0){
                alert('暂无该助记码相关信息！');
              }else{
                var html='<tr> <th ng-repeat="x in _zhujimaheads">{{x.colName}}</th></tr>' +
                  '<tr ng-repeat="x in _zhujimaBody" ng-click="selRow(x)">' +
                  '<td ng-repeat="col in _zhujimaheads">' +
                  '<span>{{x[col.colkey]}}</span>' +
                  '</td>' +
                  '</tr>' +
                  '<tr ng-if="_zhujimaBody.length==0"><td colspan="100" align="center">暂无数据…</td></tr>';
                var _el= $compile(html)(scope);
                $('#zhujimaModal .modal-body table').html(_el);
                $('#zhujimaModal').modal('show');
              }

            }else{
              alert("请检查助记码数据表是否正确！");
            }
          }).error(function (err) {
            console.log(err);
          });
        };
        scope.selRow=function (row) {
          scope.row = row;
          var me = scope;
          if (me.triggerFuns) {
            for (var i = 0; i < me.triggerFuns.length; i++) {
              me.triggerFuns[i].apply(me);
            }
          }
        };
      }else{
        scope.$execute();
      }
    }
  }
});


/!*
 BillUITextArea
 *!/

myDirectiveModule.directive('billuitextarea', function ($http, $q) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: {
      bound: "@",//
      triggers: "@",
      checkrules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@"
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$execute();
      var _parent=_$util.getParent(scope).scope;
      if(_parent._env && _parent._env.alldisabled){
        element.attr("disabled","true");
      }

    }
  }
});


/!*
 BillUIInteger
 *!/

myDirectiveModule.directive('billuiinteger', function ($http, $q) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: {
      bound: "@",//
      triggers: "@",
      checkrules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@"
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$execute();
      var _parent=_$util.getParent(scope).scope;
      if(_parent._env && _parent._env.alldisabled){
        element.attr("disabled","true");
      }
      ngModel.$viewChangeListeners.push(
        function () {
          if (ngModel.$viewValue.toString().indexOf(".") > -1) {
            ngModel.$setViewValue(ngModel.$viewValue.substring(0, ngModel.$viewValue.indexOf(".")));
            ngModel.$render();
          }
        }
      );

    }
  }
});


/!**
 * virtualField
 * outputMode:
 *
 *!/

myDirectiveModule.directive('billuiexpression', function ($http, $q) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: {
      expr: "@",//
      key: "@",
      renderid: "@"
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      mixer(exprLib, scope)
      scope.$execute();
      scope._$parentScope = _$util.getParent(scope).scope;
      //this["$"+data._models[i]]=dataObject;
      //_$parentScope["$"+key].co.
      scope.expr = BASE64.decoder(scope.expr);

      scope.findRowObject = function () {
        var parent = scope.$parent;
        while (!parent.row) {
          parent = parent.$parent;
          if (!parent) {
            return;
          }
        }
        return parent.row;
      };

      scope.findCoObject = function () {
        var parent = scope.$parent;
        while (!parent.co) {
          parent = parent.$parent;
          if (!parent) {
            return;
          }
        }
        return parent.co;
      };

      scope.row = scope.findRowObject();
      if (!scope.row) {
        scope.row = scope.findCoObject();
      }
      ;
      var preParse = function (expr) {
        var p = /#(\w*?)[.]/g;
        var p_g = expr.match(p);
        if (p_g) {

          for (var i = 0; i < p_g.length; i++) {
            var item = p_g[i];//#ssss.
            var entityKey = item.substr(1, item.length - 2);
            expr = expr.replace(item, "row.");
          }
        }
        return expr.replaceAll("@", "_$parentScope.").substr(1);
      };

      if (scope.expr.indexOf("=") > -1) {
        scope.expred = preParse(scope.expr);
        scope.$watch(scope.expred, function (newValue, oldValue) {
          // scope.row = scope.findRowObject();
          scope.row[attrs.key] = newValue;
          scope.row.shadowObj[attrs.key] = newValue;
          element.val(newValue);
        });
      } else {
        element.html(scope.expr);
      }
    }
  }
});

/!*
 BillUILong
 *!/

myDirectiveModule.directive('billuilong', function ($http, $q) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: {
      bound: "@",//
      triggers: "@",
      checkrules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@"
    },


    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$execute();
      var _parent=_$util.getParent(scope).scope;
      if(_parent._env && _parent._env.alldisabled){
        element.attr("disabled","true");
      }
      ngModel.$viewChangeListeners.push(
        function () {
          if (ngModel.$viewValue.indexOf(".") > -1) {
            ngModel.$setViewValue(ngModel.$viewValue.substring(0, ngModel.$viewValue.indexOf(".")));
            ngModel.$render();
          }
        }
      );
    }
  }
});

/!*
 BillUIDecimal
 *!/

myDirectiveModule.directive('billuidecimal', function ($http, $q) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: {
      bound: "@",//
      triggers: "@",
      checkrules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@"
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      var _parent=_$util.getParent(scope).scope;
      if(_parent._env && _parent._env.alldisabled){
        element.attr("disabled","true");
      }
      scope.$execute();
    }
  }
});


myDirectiveModule.directive('stringToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value);
      });
    }
  };
});
/!*
 BillUILabel
 *!/

myDirectiveModule.directive('billuilabel', function ($http, $q) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: {
      bound: "@",//
      triggers: "@",
      checkrules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@"
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$execute();

      element.bind("click", function () {
        var me = scope;
        if (me.triggerFuns) {
          for (var i = 0; i < me.triggerFuns.length; i++) {
            me.triggerFuns[i].apply(me);
          }
        }

      });
    }
  }
});

/!*
 BillUIButton
 *!/

myDirectiveModule.directive('billuibutton', function ($http, $q) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: {
      bound: "@",//
      triggers: "@",
      checkrules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@"
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$execute();

      var _parent=_$util.getParent(scope).scope;
      if(_parent._env && _parent._env.alldisabled){
        element.attr("disabled","true");
        if($(element).attr('key')=='goback'){
          $(element).removeAttr("disabled");
        }
      }
      scope.search = function (entityKey) {
        var $parentScope = _$util.getParent(scope).scope;
        var url = "/bill/data/refresh"
        var req = {};

        clone($parentScope._env, req);
        if (entityKey) {
          var mode = {};
          mode[entityKey] = {
            page: $parentScope._model[entityKey].page,
            params: $parentScope._model[entityKey].params
          };
          req["model"] = angular.toJson(mode);
        }
        req.fullKey = $parentScope._model[entityKey].fullDatasetKey;
        req.entityKey = entityKey;
        this.$http.post(baseUrl + url+"?isMobile=true&userInformation="+userInfo, $.param(req),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
          }).success(function (ret) {
          if (ret.status == 0) {
            alert(ret.error);
          } else if (ret.status == 1) {
            scope.__bind($parentScope, entityKey, ret.data);


          } else if (ret.status == 2) {//正常返回，但没有数据
            console.log("no data.")
          } else {
            alert("位置异常");
          }
        }).error(function (err) {
          alert(error);
        });

      },

        //cos,page
        scope.__bind = function ($parentScope, entityKey, data) {
          var dataObject = $parentScope._model[entityKey];
          dataObject.cos.clear();
          dataObject.cos.addAll(data.cos);
          clone(data.page, dataObject.page);
          dataObject.co = null;
          dataObject.sos.clear();
          dataObject.dels.clear();
          if (dataObject.head) {
            dataObject.co = dataObject.cos[0];
            $parentScope[entityKey] = dataObject.co;
            $parentScope["$" + entityKey] = dataObject;
          } else {
            $parentScope["__$" + entityKey + "$__"] == dataObject.cos;
            $parentScope["$" + entityKey] = dataObject;
          }
          //发送修改广播
          $parentScope.$broadcast('$_MODEL_CHANGE_$', $parentScope._model);

        }

      element.bind("click", function () {
        var me = scope;
        if (me.triggerFuns) {
          for (var i = 0; i < me.triggerFuns.length; i++) {
            me.triggerFuns[i].apply(me);
          }
        }

      });
    }
  }
});
*/


myDirectiveModule.directive('billuidatetime', function ($http, $q, Common) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: {
      bound: "@",//
      triggers: "@",
      checkrules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@",
      dateFormat:"@"
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$execute();
      var _parent=_$util.getParent(scope).scope;
      if(_parent._env && _parent._env.alldisabled){
        element.attr("disabled","true");
      }
      //更新模型，注册为了让模型更新的事件在angularjs上下文中工作，

      var add0 = function (m) {
        return m < 10 ? '0' + m : m
      };
      scope.formatDate = function (date) {
        var now = new Date(date);
        var y = now.getFullYear();
        var m = now.getMonth() + 1;
        var d = now.getDate();
        var h = now.getHours();
        var mm = now.getMinutes();
        var s = now.getSeconds();
        return y + '-' + add0(m) + '-' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
      };

      var updateModel = function (dateTxt) {
        scope.$apply(function () {
          ngModel.$setViewValue(dateTxt);
        });
      };
      if (ngModel.$viewValue) {
        updateModel(scope.formatDate(ngModel.$viewValue))
      }

      if (!attrs.readonly) {
        var datepickerHandler = {
          init: function () {
            var _self = this;
            if (typeof element.datetimepicker == 'function') {
              Common.loadScript('/lib/js/locales/bootstrap-datetimepicker.zh-CN.js', null);
              if(scope.dateFormat=='yyyy-mm-dd hh:ii:ss'){
                scope.showType=null;
              }else{
                scope.showType='month';
              }
              element.datetimepicker({
                language: 'cn',
                format: scope.dateFormat,//显示格式
                weekStart: 1,
                todayBtn: 1,
                autoclose: 1,
                todayHighlight: 1,
                startView: 2,
                forceParse: 0,
                showMeridian: 1,
                minView: scope.showType
              });
              element.on('focus', function () {
                element.datetimepicker();
              });
              //绑定changeDate事件，当界面变化时通知模型
              element.datetimepicker().on('changeDate', function (ev) {
                //将中国标准时间格式化为时间戳；
                // var _date = Math.round(ev.date.getTime()/1000);
                var _dateTime = scope.formatDate(ev.date);
                updateModel(_dateTime);
              });
            } else {
              Common.loadCss('/lib/css/bootstrap-datetimepicker.min.css', null);
              Common.loadScript('/lib/js/bootstrap-datetimepicker.min.js', null);
              Common.loadScript('/lib/js/locales/bootstrap-datetimepicker.zh-CN.js', function () {
                _self.init();
              });
            }
          }
        }
        datepickerHandler.init();
      }
    }
  }
});

/*
/!*
 billuigrid
 billuigrid的两种操作模式：
 1.编辑模式；

 2.查看模式：
 *!/
/!*
 billuigrid
 billuigrid的两种操作模式：
 1.编辑模式；

 2.查看模式：
 *!/

myDirectiveModule.directive('billuigrid', function ($http, $q, $compile, Common, $filter) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    templateUrl: "views/_gridview.html",
    scope: {
      triggers: "@",
      checkrules: "@",
      init: "@",
      key: "@",
      renderid: "@",
      optMode: "@",
      selectMode: "@",
      tableKey: "@",//实体key
      heads: "@",
      rowId: "@",
      rowCheckRule: "@",
      sorts: "@",  //排序方式
      doubleClickHandler: "@",
      onClickHandler: "@",
      delHandler: "@deltriggers",
      tableType: "@",
      rules: "@",  //规则
      hideAddRow: "@",
      isfull: "@",
      calctype:"@",
      calcsite:"@calcSite"
    },
    controller: function ($scope, $element, $attrs) {
      $scope.filter;
      $scope.exitsCol = function (row, col) {
        for (var p in row) {//遍历 src对象,并将所有属性赋值给target，从而实现对象的混合
          if (p == col) {
            return true;
          }
        }
        return false;
      };
      //新增行
      $scope.addRow = function () {
        if ($scope.template) {
          var _model = $scope.rows;
          var _value = 0;

          for (var i = 0; i < _model.length; i++) {
            if (_model[i].SN > _value) {
              _value = _model[i].SN;
            }
          }
          $scope.template.SN = _value + 1;
          $scope.template.isNullRow = true;
          $scope.rows.push(clone($scope.template, {}));
        } else {
          alert("还没有绑定数据模型.");
        }
      };

      //删除行
      $scope.delRow = function () {
        if ($scope.co) {
          for (var i = 0; i < $scope.rows.length; i++) {
            if ($scope.rows[i] == $scope.co) {
              if ($scope.co.BillDtlID) {
                $scope.$parent._model[$scope.tableKey].dels.push($scope.co);
              }
              $scope.rows.splice(i, 1);
              break;
            }
          }
        } else {
          alert("请选择行.");
        }
      };

      $scope.rowCheckRuleFun = null;
      $scope.rowCheckRuleFunMeta = null;
      $scope._parseRowCheckRuleFun = function () {
        if ($scope.rowCheckRule) {
          try {
            var base64expr = BASE64.decoder($scope.rowCheckRule);
            var exprs = base64expr.split(",");
            if (exprs.length != 3) {
              return;
            }
            $scope.rowCheckRuleFunMeta = {
              expr: exprs[0],
              tClass: exprs[1],
              fClass: exprs[2],
            };
            $scope.rowCheckRuleFun = new Function('row', "return " + $scope.rowCheckRuleFunMeta.expr);
            $scope.rowCheckRuleFun.apply(row);
          } catch (e) {
            //alert(e);
          }
        }
      };

      $scope.setStyle = function (row, index) {
        $scope.buildRowIndex(row, index);
        if ($scope.co != null) {
          if (row == $scope.co) {
            return "info";
          }
        }
        if (!$scope.rowCheckRuleFun) {
          $scope._parseRowCheckRuleFun();
        } else {
          var result = $scope.rowCheckRuleFun.apply(row);
          if (result) {
            return $scope.rowCheckRuleFunMeta.tClass;
          } else {
            return $scope.rowCheckRuleFunMeta.fClass;
          }
        }

      };
      $scope._rowIndex = [];
      $scope.buildRowIndex = function (row, index) {
        $scope._rowIndex[index] = row;
      };

      $scope.as = false;
      //全选
      $scope.allSelect = function () {
        $scope.as = !$scope.as;
        var _cos = $scope.$parent._model[$scope.tableKey].cos;
        if ($scope.as) {
          for (var i = 0; i < $scope.sos.length; i++) {
            //从sos中清除当前页的cos;
            for (var j = 0; j < $scope.rows.length; j++) {
              if ($scope.sos.length>0){
                if ($scope.sos[i].rowID == $scope.rows[j].rowID) {
                  $scope.sos.delByValue($scope.sos[i]);
                }
              }

            }
          }

          for (var i = 0; i < $scope.rows.length; i++) {
            if (!$scope.rows[i].isDisable) {
              //没有被禁用的行才可以被选中
              $scope.sos.push($scope.rows[i]);
            }
          }
          $scope.$parent._model[$scope.tableKey].sos = $scope.sos;
        } else {
          for (var i = 0; i < $scope.sos.length; i++) {
            //从sos中清除当前页的cos;
            for (var j = 0; j < $scope.rows.length; j++) {
              if ($scope.sos.length>0){
                if ($scope.sos[i].rowID == $scope.rows[j].rowID) {
                  $scope.sos.delByValue($scope.sos[i]);
                }
              }
            }
          }
          $scope.$parent._model[$scope.tableKey].sos = $scope.sos;
        }

        var retModel = {
          entityKey: $scope.tableKey,
          rows: $scope.sos
        };
        $scope.$emit("_$popreturnmodel$_", retModel);
      };
      $scope.currSos = [];
      $scope.sos = [];
      $scope.inSos = function (row) {
        for (var i = 0; i < $scope.sos.length; i++) {
          if ($scope.sos[i].rowID == row.rowID) {
            return true;
          }

        }
        return false;
      };
      //选择行
      $scope.select = function (row) {
        if ($scope.selectMode == "radio") {
          $scope.sos.clear();
        }
        $scope.sos.push(row);
        $scope.$parent._model[$scope.tableKey].sos = $scope.sos;
      };

      $scope.cancelSelect = function (row) {
        for (var i = 0; i < $scope.sos.length; i++) {
          if ($scope.sos[i].rowID == row.rowID) {
            $scope.sos.delByValue(row);
            $scope.$parent._model[$scope.tableKey].sos = $scope.sos;
          }

        }
      };
      //    筛选列
      $scope.delHead = function (item) {
        if (item.isChecked == true) {
          item.isChecked = false;
          item.isHide = true;
        } else {
          item.isChecked = true;
          item.isHide = false;
        }
      }
     //  求和  品均值等公示
      $scope.getCalc = function (keyarr,rows) {
        var _obj={};
        if(rows){
          var _model = rows;
        }else{
          var _model = $scope.rows;
        }
        // if (_model && _model.length == 0) {
        //     return;
        // }
        angular.forEach(keyarr, function (data, index, array) {
          var type = keyarr[index].formular;
          var key = keyarr[index].key;
          var _value = 0;
          if (type == 'Sum') {
            angular.forEach(_model, function (data, index, array) {
              _value += _model[index][key]-0 ;
            });
            _value = "合计：" + _value.toFixed(2);

          } else if (type == 'Avg') {
            angular.forEach(_model, function (data, index, array) {
              _value += _model[index][key]-0;
            });
            _value = "平均值：" + _value / _model.length;
          } else if (type == 'Max') {
            var _value = _model[0][key];
            angular.forEach(_model, function (data, index, array) {
              if (_model[index][key] > _value) {
                _value = _model[index][key];
              }
            });
            _value = "最大值：" + _value.toFixed(2)
          } else if (type == 'Min') {
            var _value = _model[0][key];
            angular.forEach(_model, function (data, index, array) {
              if (_model[index][key] < _value) {
                _value = _model[index][key];
              }
            });
            _value = "最小值：" + _value
          }
          _obj[key] = _value;
          // window.$body[$scope.tableKey].formulaCols[key] = _value;
          var parent = _$util.getParent($scope).scope;
          var model=parent._model[$scope.tableKey].formulaCols;
          model.clear();
          model.push(_obj);


          // window.$body[$scope.tableKey].formulaCols.clear();
          // window.$body[$scope.tableKey].formulaCols.push(_obj);
          // window.$body[$scope.tableKey].formulaCols.length=1;
        });


      };
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用

      //混合器，指令初始代码
      mixer(abstractDirective, scope);

      var parent = _$util.getParent(scope);
      var entityKey = scope.tableKey;
      scope.$execute();//混合
      if (scope.rules && scope.rules !== '') {
        scope.rules = BASE64.decoder(scope.rules);
        parent.scope._env.rules[entityKey] = eval('(' + scope.rules + ')');
      }
      ;
      scope._watchHodler = null;
      scope.setPage = function (num) {
        NProgress.start();
        if (num < 1) {
          alert('目标页数不能小于1');
          return;
        } else if (num > scope.pageInfo.totalPage) {
          alert('目标页数大于最大页');
          return;
        }
        var _pageInfo = scope.pageInfo;
        if (num == 'next') {
          if (scope.pageInfo.pageNumber < scope.pageInfo.totalPage) {
            _pageInfo.pageNumber = scope.pageInfo.pageNumber + 1;
          } else {
            return;
          }
        } else if (num == 'prev') {
          if (scope.pageInfo.pageNumber !== 1) {
            _pageInfo.pageNumber = scope.pageInfo.pageNumber - 1;
          } else {
            return;
          }
        } else if (num == 'begin') {
          _pageInfo.pageNumber = 1;
        } else if (num == 'end') {
          _pageInfo.pageNumber = scope.pageInfo.totalPage;
        } else {
          _pageInfo.pageNumber = num;
        }
        scope.goToPage(scope.tableKey, _pageInfo);
        NProgress.done();
      };

      scope.goToPage = function (entitykey, _pageInfo) {
        var me = _$util.getParent(scope).scope;
        // /收集参数
        var entityKey = entitykey;
        var fullKey = me._model[entityKey].fullDatasetKey;
        var page = {
          pageNumber: _pageInfo.pageNumber,
          pageSize: _pageInfo.pageSize,
          totalPage: _pageInfo.totalPage,
          totalRow: _pageInfo.totalRow,
        };
        //var params=me._model[entityKey].params;
        var mode = {};
        mode[entityKey] = {
          page: page,
          params: me._model[entityKey].params
        };
        //发送ajax请求
        var req = {entityKey: entitykey, fullKey: fullKey, page: angular.toJson(page)};
        req["model"] = angular.toJson(mode);
        clone(me._env, req);
        scope.$http.post("/bill/data/refresh", $.param(req),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
          }).success(function (ret) {
          //
          if (ret.status == 0) {
            alert(ret.error);
          } else if (ret.status == 1) {
            //me.refresh(entitykey,data.data);
            var entity = me._model[entitykey];
            if (entity) {
              entity.cos.splice(0, entity.cos.length);
              for (var i = 0; i < ret.data.cos.length; i++) {
                entity.cos.push(ret.data.cos[i]);
              }
              clone(ret.data.page, entity.page);
            }
            me.$broadcast('$_MODEL_CHANGE_$', me._model);
          } else {
            alert("unknown error.");
          }

        }).error(function (err) {
          alert("分页失败,原因:" + err);
        });
      }
      //快速导航
      scope.fastEdit = function () {
        if (!scope.co || Object.getOwnPropertyNames(scope.co).length == 0) {
          scope.co = scope.rows[0];
          scope._index = 0;
        }
        if (scope.co && Object.getOwnPropertyNames(scope.co).length !== 0) {
          var btn = '<div class="fastEditRows">' +
            // '<button class="btn btn-primary btn-sm" ng-click="setPage(\'prev\')"  ng-disabled="pageInfo.pageNumber===1">上一页</button>' +
            '<button class="btn btn-primary btn-sm" ng-click="preLine()" ng-disabled="_index==0">上一行</button>' +
            '<button class="btn btn-primary btn-sm" ng-click="nextLine()" ng-disabled="_index==rows.length - 1">下一行</button>' +
            // '<button class="btn btn-primary btn-sm" ng-click="setPage(\'next\')" ng-disabled="pageInfo.pageNumber===pageInfo.totalPage">下一页</button>' +
            '</div> '
          var dom = '<ul class="fastEdit clearfix">' +
            '<li class="clearfix" ng-repeat="x in _$heads">' +
            '<label class="pull-left" >{{x.caption}}</label> ' +
            '<div class="pull-left" widget="{{x.widget}}" ng-if="optMode==\'edit\' && !isExpred(x.col)" metawidget model="co[x.col]"></div>' +
            '<div class="pull-left" widget="{{x.widget}}" ng-if="optMode==\'view\' || isExpred(x.col)">{{co.shadowObj[x.col]}}</div>' +
            '</li></ul>';
          var el = $compile(dom)(scope);
          var btn = $compile(btn)(scope);
          $('#myModal .modal-header h4').html('快速导航');
          $('#myModal .modal-body').html(el);
          $('#myModal .modal-footer').html(btn);
          $('#myModal').modal('show');
        } else {
          alert('暂无数据');
        }
      };
      if (scope.optMode == 'view') {
        $("#myModal").keydown(function (event) {
          var myEvent = event || window.event; //解决不同浏览器获取事件对象的差异
          switch (myEvent.keyCode) {
            case 37:// 左
              scope.preLine();
              break;
            case 39:// →
              scope.nextLine();
              break;
          }
        });
      }
      //判断是不是虚拟列
      scope.isExpred = function (col) {
        if (scope.co.shadowCol) {
          for (var i = 0; i < scope.co.shadowCol.length; i++) {
            if (col == scope.co.shadowCol[i]) {
              return true;
            }
          }
        }
      };
      scope.preLine = function () {
        // scope._index
        if (scope._index > 0) {
          scope._index = scope._index - 1
        } else {
          // scope.setPage('prev');
          // scope._index = scope.rows.length - 1;
        }
        scope.co = scope._rowIndex[scope._index];
      };
      scope.nextLine = function () {
        // scope._index
        if (scope._index == scope.rows.length - 1 || scope._index > scope.rows.length) {
          // scope._index = scope.rows.length - 1;
          // scope.setPage('next');
          // scope._index = 0;
        } else {
          scope._index = scope._index + 1;
        }
        scope.co = scope._rowIndex[scope._index];
      };


      //排序数据集

      if (scope.sorts && scope.sorts != '') {
        var sortOpt = BASE64.decoder(scope.sorts);
        scope.sortOpt = eval(sortOpt);
        for (var i = 0; i < scope.sortOpt.length; i++) {
          scope.sortOpt[i]._type = 1;
        }
        ;
      }
      //排序model
      scope.sortType = '';
      scope.sortName = '';
      scope.setSortType = function (x, t) {
        scope.sortName = x.caption;
        if (t == 1) {
          //正
          x._type = 1;
          scope.sortType = x.col;
        } else if (t == 0) {
          scope.sortType = '-' + x.col;
          x._type = 0;
        }
      };

      /!**
       * 绑定行模型
       *!/
      scope.rows = [];
      scope.bindRowsModel = function () {
        //寻找我的父
        scope.currSos = [];

        if (!parent.scope._model) {
          alert("grid的父模型构建不完整.");
        }

        if (parent.scope._model[entityKey]) {
          //绑定行数据；
          // scope.rows = parent.scope._model[entityKey].cos;
          scope.rows = scope.__initFormatters(parent.scope._model[entityKey].cos, scope.formatterObj);
          //原型信息；
          scope.template = parent.scope._model[entityKey].archetype;
          //行汇总信息
          scope.formulaCols = parent.scope._model[entityKey].formulaCols;

          scope.pageInfo = parent.scope._model[entityKey].page;  //分页信息。
          var _totalPage = parent.scope._model[entityKey].page.totalPage;
          scope.pageInfo.pageItems = [];
          var _pageStart = 1;
          scope.skipPage = scope.pageInfo.pageNumber;
          if (scope.pageInfo.pageNumber < 3) {
            var _pageStart = 1;
          } else if (scope.pageInfo.pageNumber > 5) {
            if (_totalPage - scope.pageInfo.pageNumber <= 2) {
              var _pageStart = _totalPage - 4;
            } else {
              var _pageStart = scope.pageInfo.pageNumber - 2;
            }
          } else {
            var _pageStart = scope.pageInfo.pageNumber - 2;
          }

          for (var i = _pageStart; i <= _totalPage; i++) {
            scope.pageInfo.pageItems.push(i);
          }

          //
          if (scope._watchHodler) {
            scope._watchHodler();
          }
          ;

          scope.$watch("co", function (newValue, oldValue) {//
            if ((oldValue && !isEmptyObject(oldValue)) && (newValue && !isEmptyObject(newValue))) {
              scope.co;
              var isSame = cmp(newValue, oldValue);
              if (isSame == false) {
                scope.co.isNullRow = false;
              }
            }
          }, true);

          scope._watchHodler = scope.$watch("rows", function () {//
            //检测行模型改变的时候是否需要格式化？
            scope.rows = scope.__initFormatters(scope.rows, scope.formatterObj);
            //拿到行模型之后进行业内计算
            if (scope.keyArr && scope.rows && scope.keyArr.length > 0  && scope.rows.length > 0  && (!scope.calctype || scope.calctype!=='sos' )) {
              // 当需要计算的列>1的时候才计算；
              scope.getCalc(scope.keyArr);
            };
            var me = scope;
            if (me.triggerFuns) {
              for (var i = 0; i < me.triggerFuns.length; i++) {
                me.triggerFuns[i].apply(me);
              }
            }
          }, true);
        }
        ;
        NProgress.done();
      };
      //选中行
      scope.curRowSelect = function (row, index) {
        if (parent.scope._env && parent.scope._env.alldisabled) {
          return
        }
        ;
        if (row.isDisable) {
          alert("当前行已禁用，无法被选中！");
          return;
        }
        scope._index = index;
        scope.co = row;
        parent.scope._model[entityKey].co = row;
        if (scope.optMode == "view" && scope.selectMode == "single") {
          scope.sos.clear();
          scope.sos.push(row);
          parent.scope._model[entityKey].sos = scope.sos;
        }
        var retModel = {
          entityKey: entityKey,
          rows: scope.sos
        };
        scope.$emit("_$popreturnmodel$_", retModel);

      };
      //取消选中
      scope.cancelClick = function () {
        scope.co = {};
        scope.readonly = true;
        // $('input,textarea').popover('hide');
      };
      //检测sos
      scope.$watch("sos", function (newValue, oldValue) {//
        if(scope.calctype && scope.calctype =='sos'){
          scope.getCalc(scope.keyArr,scope.sos);
        }
      }, true);

      scope.$on('$_MODEL_CHANGE_$', function (e, model) {
        NProgress.start();
        if (scope.$parent._env && scope.$parent._env.alldisabled) {
          element.find('input,button,select').attr("disabled", "true");
          element.find('.shaixuan *,.fastEditBtn').removeAttr("disabled");
        }
        scope.bindRowsModel();

        //往体模型中塞是否可以保存空的标识
        if (scope.isfull && scope.isfull == "true") {
          window.$body[scope.tableKey].canSaveNull = true;
        }
        ;
      });
      /!**
       * 绑定头部模型
       *!/
      scope.bindHeadModel = function () {
        //渲染表头信息；
        var _heads = BASE64.decoder(scope.heads);
        scope.formatterObj = [];
        try {
          scope._$heads = JSON.parse(_heads);
          scope.keyArr = [];

          angular.forEach(scope._$heads, function (data, index, array) {
            scope._$heads[index].isChecked = true;
            scope._$heads[index].isHide = false;
            if (scope._$heads[index].formularType && scope._$heads[index].formularType == 'Page') {
              scope.keyArr.push({
                'key': scope._$heads[index].col,
                'formular': scope._$heads[index].formularMode
              });
            }
            ;
            var _widget = BASE64.decoder(data.widget);
            if ($(_widget).children().length > 0) {
              var _key = $(_widget).children().attr('key');
              var _formatter = $(_widget).children().attr('formatters');
            } else {
              var _key = $(_widget).attr('key');
              var _formatter = $(_widget).attr('formatters');
            }
            var currArr = {};
            currArr.key = _key;
            currArr.formatter = _formatter;
            scope.formatterObj.push(currArr);
          });


        } catch (error) {
          alert("grid head error:" + scope.key);
        }
      };
      scope.bindHeadModel();
      // scope.bindRowsModel();

      //删除触发器
      scope.delClickHandler = function () {
        var me = scope;
        if (!(me.delHandler == null || me.delHandler == "")) {
          var fun_str = BASE64.decoder(me.delHandler);
          //分析脚本中@调用
          try {
            var fun_def = JSON.parse(fun_str);
            for (var i = 0; i < fun_def.length; i++) {
              if (!me.delHandlerFuns) {
                me.delHandlerFuns = [];//触发器数组
              }
              var trigger = me.__resolve(fun_def[i]);
              me.delHandlerFuns.clear();
              me.delHandlerFuns.push(new Function('scope', trigger));
            }
          } catch (error) {
            alert(me.key + " 双击事件语法错误，请核对.");
          }
        }
      };
      //双击事件语法解析
      scope.dblClickHandler = function () {
        var me = scope;
        if (!(me.doubleClickHandler == null || me.doubleClickHandler == "")) {
          var fun_str = BASE64.decoder(me.doubleClickHandler);
          //分析脚本中@调用
          try {
            var fun_def = JSON.parse(fun_str);
            for (var i = 0; i < fun_def.length; i++) {
              if (!me.dblclickFuns) {
                me.dblclickFuns = [];//触发器数组
              }
              var trigger = me.__resolve(fun_def[i]);
              me.dblclickFuns.clear();
              me.dblclickFuns.push(new Function('scope', trigger));
            }
          } catch (error) {
            alert(me.key + " 双击事件语法错误，请核对.");
          }
        }
      };

      //单击事件语法解析
      scope.clickHandler = function () {
        var me = scope;
        if (!(me.onClickHandler == null || me.onClickHandler == "")) {
          var fun_str = BASE64.decoder(me.onClickHandler);
          //分析脚本中@调用
          try {
            var fun_def = JSON.parse(fun_str);
            for (var i = 0; i < fun_def.length; i++) {
              if (!me.onclickFuns) {
                me.onclickFuns = [];//触发器数组
              }
              var trigger = me.__resolve(fun_def[i]);
              me.onclickFuns.clear();
              me.onclickFuns.push(new Function('scope', trigger));
            }
          } catch (error) {
            alert(me.key + " 单击事件语法错误，请核对.");
          }
        }
      };

      //删除行事件
      scope.delHook = function (row) {
        scope.delClickHandler(row);
        scope.row = row;
        var me = scope;
        if (me.delHandlerFuns) {
          for (var i = 0; i < me.delHandlerFuns.length; i++) {
            me.delHandlerFuns[i].apply(me);
          }
        }
      };
      //行双击钩子事件
      scope.trHook = function (row) {
        scope.dblClickHandler(row);
        scope.row = row;
        var me = scope;
        if (me.dblclickFuns) {
          for (var i = 0; i < me.dblclickFuns.length; i++) {
            me.dblclickFuns[i].apply(me);
          }
        }
      };
      //    单击事件钩子
      scope.clickHook = function (row) {
        scope.clickHandler(row);
        scope.row = row;
        var me = scope;
        if (me.onclickFuns) {
          for (var i = 0; i < me.onclickFuns.length; i++) {
            me.onclickFuns[i].apply(me);
          }
        }
      };
      //
      //    拖拽
      scope.dropComplete = function (index, obj) {
        var idx = scope._$heads.indexOf(obj);

        scope._$heads.splice(idx, 1);
        scope._$heads.splice(index, 0, obj);
        // scope._$heads[idx] = scope._$heads[index];
        // scope._$heads[index] = obj;
      };
    }
  }
});

/!**
 * 动态根据widget元信息，创建widget的指令
 *!/
myDirectiveModule.directive('metawidget', function ($compile) {
  return {
    restrict: 'EA',
    scope: false,
    link: function (scope, element, attrs) {//链接端函数
      var widget = attrs.widget;
      var model = attrs.model;
      var dom = BASE64.decoder(widget);
      dom = dom.replace("__$d_model$__", model);
      var el = $compile(dom)(scope);//编译，这里需要获取视图的，当时视图需要获取自己的渲染id
      element.append(el);
      scope.$broadcast('$_MODEL_CHANGE_$', this._model);
    }
  }
});

/!**
 * billdataset指令，用于加载数据集
 * ---定义主数据集
 *       <dataset key="" bill-type="Bill,MultiBill,Dictionary,Report" bill-key="" bill-id=""
 *         binding="view|controller"
 *       />
 *
 * ---定义应用数据集
 * <dataset  key=""  />
 *
 *!/
myDirectiveModule.directive('dataset', function ($http, $q, $compile) {
  return {
    restrict: 'E',
    require: '?ngModel',
    scope: {
      triggers: "@",
      checkrules: "@",
      init: "@",
      key: "@",
      renderid: "@",
    },
    controller: function ($scope, $element, $attrs) {

    },
    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$execute();//混合


    }
  }
});
// 列指令
myDirectiveModule.directive('colummeta', function ($compile) {
  return {
    restrict: 'EA',
    scope: false,
    link: function (scope, element, attrs) {//链接端函数

    }
  }
});


//docker 容器指令
myDirectiveModule.directive('docker', function ($http, $q, $compile) {
  return {
    restrict: 'EA',
    require: '?ngModel',
    scope: {
      triggers: "@",
      checkrules: "@",
      init: "@",
      key: "@",
      renderid: "@",
      tableKey: "@"
    },
    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$execute();//混合
      // 判断是否具有子元素，如果没有子元素，display为none；
      if (element.children.length == 0) {
        element.css('display', 'none');
      }
    }
  }
});

//模版指令
myDirectiveModule.directive('billuitemplate', function ($http, $q, $compile) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    templateUrl: 'views/_popup.html',
    scope: false,
    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$execute();

    }
  }
});

//弹窗框  BillUIPopupWindow
//billuipopupwindow
myDirectiveModule.directive('billuipopupwindow', function ($http, $q, $compile) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: {
      bound: "@",//
      triggers: "@",
      checkrules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@",
      viewsize:"@"
    },
    link: function (scope, element, attrs, ngModel) {//链接端函数

      scope.$on("__$_view_created__$__", function (event, obj) {
        scope._$childview = obj.scope;
      });
      scope._$$popwin$$="_$$popwin$$";
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      scope.$flag = "POPWIN";
      scope.$on("_$popreturnmodel$_", function (event, data) {
        scope.rows = data.rows;
        var me = scope;
        if (me.triggerFuns) {
          for (var i = 0; i < me.triggerFuns.length; i++) {
            me.triggerFuns[i].apply(me);
          }
        }
      });
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$executePopup();
      //alert(attrs.src);
      var parent = _$util.getParent(scope);
      if (!parent.scope._model) {
        alert("父模型构建不完整.");
      }
      scope._model = new $Model(parent.scope._model);
      scope._env=new $Env(parent.scope._env);

      scope.setEnvModel=function (model) {
        var _model=eval(model);
        clone(model,scope._env);
      };


      scope.template = "<div src='" + attrs.src + "'billuiview  />";
      element.on('click', function () {
        scope.__initPopwin();
        if (scope._$childview) {
          scope._$childview.$destroy();
        }

        if(scope.viewsize=='lg'){
          $('#myModal .modal-dialog').addClass('modal-lg');
        }else if(scope.viewsize=='normal'){
          $('#myModal .modal-dialog ').removeClass('modal-lg');
        }else if(scope.viewsize=='sm'){
          $('#myModal .modal-dialog ').removeClass('modal-lg');
          $('#myModal .modal-dialog ').addClass('modal-sm');
        }
        var dom = $compile(scope.template)(scope);

        $('#myModal .modal-body').html(dom);
        // $('#myModal .modal-body').addClass('modalBodyStyle');
        $('#myModal').modal('show');

      });


    }
  }
});
//checkbox   billuicheckbox
myDirectiveModule.directive('billuicheckbox', function ($http, $q, $compile) {
  return {
    restrict: 'EA',
    require: '?^ngModel',
    scope: {
      triggers: "@",
      checkrules: "@",
      properties: "@",
      init: "@",
      key: "@",
      renderid: "@",
      tableKey: "@",
      sourceSrc: "@"
    },
    template: " <label class=\"uicheckbox\" ng-repeat=\"x in ds_array\" ng-class=\"{'checked':x.selected}\"><input  type=\"checkbox\"  name=\"{{checkboxname}}\"  ng-value=\"x\"  ng-checked=\"x.selected\"  ng-click=\"toggleSelection(x)\">{{x.name}} </label>",
    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$execute();//混合
      var parent = _$util.getParent(scope);
      var entityKey = parent.scope._env.billkey;
      scope.ds_array = {};    // 完整模型
      scope.selection = [];  //选中的值
      scope.checkboxname = attrs.key;
      //初始化数据
      scope._initCheckbox = function () {
        scope.selection.clear();
        try {
          scope.selection = parent.scope._model[entityKey].co[attrs.key].split(",");
          for (var i = 0; i < scope.ds_array.length; i++) {
            for (var j = 0; j < scope.selection.length; j++) {
              if (scope.ds_array[i].value == scope.selection[j]) {
                scope.ds_array[i].selected = true;
              }
            }
          };
        } catch (e) {
          console.log('初始化选中状态错误：' + e)
        }
        //初始化选中
      };
      //

      scope.$on('$_MODEL_CHANGE_$', function () {
        scope._initCheckbox();
      });


      scope.loadDataSource = function () {
        var _cacheSelect=window.sessionStorage.getItem(scope.key);
        if(_cacheSelect && _cacheSelect!=='') {
          scope.ds_array = JSON.parse(_cacheSelect);
          scope._initCheckbox();
        }else  if (scope.sourceSrc && scope.sourceSrc !== "") {
          var _src = scope.sourceSrc;
          $http.get(_src+"?isMobile=true&userInformation="+userInfo).success(function (result, status, headers, config) {
            var _ds = [];
            var data=result.data;
            if(data && data!==''){
              for (var i = 0; i < data.length; i++) {
                _ds.push({
                  "name": data[i].v,
                  "value": data[i].k,
                  "selected":false
                });
                scope.ds_array = _ds;
              };
              window.sessionStorage.setItem(scope.key,JSON.stringify(_ds));
              scope._initCheckbox();
            }
          }).error(function (data, status, headers, config) {
            console.log(status);
          });

        } else if (scope.properties && scope.properties !== "") {
          var ds_array = eval(BASE64.decoder(scope.properties));
          scope.ds_array = ds_array[0].value;
          scope._initCheckbox();
        } else {
          alert("没有设置数据源properties属性，checkbox控件无法工作");
        };
      };
      scope.toggleSelection = function (item) {
        //先判断已经选中的节点
        var idx;
        var _index;
        for(var i = 0;i<scope.selection.length;i++){
          if(scope.selection[i]==item.value){
            idx=true;
            _index=i;
          }
        }

        if (item.selected == false) {
          item.selected = true;
          scope.selection.push(item.value);
        } else {
          item.selected = false;
          if (idx) {
            scope.selection.splice(_index, 1);
          }
        }//
        var __viewValue = scope.selection.join(",");
        scope.ngModel.$setViewValue(__viewValue);
      };
    },

  }
});


//radio   billuiradio
myDirectiveModule.directive('billuiradio', function ($http, $q, $compile) {
  return {
    restrict: 'EA',
    require: '?ngModel',
    scope: {
      triggers: "@",
      checkrules: "@",
      properties: "@",
      init: "@",
      key: "@",
      renderid: "@",
      tableKey: "@",
    },
    template: " <label ng-repeat=\"x in ds_array\"><input  type=\"radio\"  name=\"{{checkboxname}}\"  ng-value=\"x\"  ng-checked=\"x.value==selection\"  ng-click=\"toggleSelection(x)\">{{x.name}} </label>",
    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      scope.$execute();//混合
      // 判断是否具有子元素，如果没有子元素，display为none；
      scope.selection = '';  //选中的值
      scope.checkboxname = attrs.key;
      scope.loadDataSource = function () {
        if (scope.sourceSrc && scope.sourceSrc !== "") {
          scope.ds_array = {};
          // var _src = eval(BASE64.decoder(scope.sourceSrc));
          var _src = scope.sourceSrc;
          $http.get(_src+"?isMobile=true&userInformation="+userInfo).success(function (data, status, headers, config) {
            var _ds = [];
            for (var i = 0; i < data.length; i++) {
              _ds.push({
                "name": data[i][attrs.v],
                "value": data[i][attrs.k]
              });
              scope.ds_array = _ds;

            }
          }).error(function (data, status, headers, config) {
            console.log(status);
          });

        } else if (scope.properties && scope.properties !== "") {
          var ds_array = eval(BASE64.decoder(scope.properties));
          scope.ds_array = ds_array[0].value;
          scope.selection = scope.ngModel.$viewValue;
          //初始化选中
        } else {
          alert("没有设置数据源properties属性，radio控件无法工作");
        };
      };


      scope.toggleSelection = function (item) {
        scope.selection = item;
        scope.ngModel.$setViewValue(item.value);
        console.log(scope.ngModel)
      };
    },

  }
});

//zhujimatemplate
myDirectiveModule.directive('zhujimatemplate', function ($http, $compile) {
  return {
    restrict: 'EA',
    require: '?ngModel',
    scope: false,
    templateUrl: "views/_zhujima.html",
    link: function (scope, element, attrs, ngModel) {//链接端函数


    }
  }
});


/!**
 *      选择框指令
 *      参数说明如下：
 *      1.action为请求后端数据的action,其中controller为api
 *      2.key   为数据的实际值
 *      3.value  为数据的表现值 *
 *      4.check-model为绑定的模型，这个模型一般为父控制器中的模型值
 *      5.fields:为需要显示的字段
 *      6.heads:为需要显示字段的中文名称
 *      <div ng-controller="testupController as main" >
 *              <div checkboxgroup  check-model="mychecks"  action="checks"  key="id" value="name"  fields="" heads=""/>
 *       </div>
 *
 *!/
myDirectiveModule.directive('checkboxgroup', function () {
  return {
    restrict: 'A',
    scope: {
      checkModel: "=",
      action: "@",
      key: "@",
      value: "@",
      fields: "@",
      heads: "@",
      searchs: "@",
    },
    templateUrl: "views/_checkboxgroup.html",
    link: function ($scope, $element, $attrs, common_service) {//链接函数
      //监控数据模型的变化
      $scope.$watch("checkModel", function (newValue, oldValue, scope) {
        $scope.initDom();
      });
      $scope.$watch("$currentData", function (newValue, oldValue, scope) {
        if (newValue) {
          $scope.initDom();
        }
      });
      //初始时，链接对应的DOM结构
      $scope.initDom();

    },

    controller: function ($scope, $element, $attrs, $transclude, common_service) {//指令的控制器

      if (!$scope.$currentData) {
        common_service.list($scope.action).success(
          function (responseData) {
            $scope.$currentData = responseData;
          }
        ).error(function (data, status, headers, config) {
          alert("连接错误，错误码：" + status);
        });
      }
      $scope.tid = "T" + GUID();
      $scope.pid = "F" + GUID();
      $scope.head_list = $scope.heads.split(",");
      $scope.fields_list = $scope.fields.split(",");
      if ($scope.searchs != undefined) {
        $scope.search_list = $scope.searchs.split(";");
      }

      $scope.check_arr = [];
      //初始化dom,如果dom不存在
      $scope.initDom = function () {
        if ($scope.$currentData) {
          $scope.createDom();

        }
      }

      $scope.createDom = function () {
        $element.find("#" + $scope.tid).empty();
        //初始显示值
        if ($scope.checkModel) {
          var t_checkes = $scope.checkModel.split(",");
          $scope.check_arr = t_checkes;
        } else {
          $scope.check_arr = [];
          var t_checkes = [];
        }
        for (var i = 0; i < t_checkes.length; i++) {
          var t_key = t_checkes[i];//获取key
          var t_value = $scope.findValue(t_key);
          if (t_value) {
            if (i == t_checkes.length - 1) {
              $element.find("#" + $scope.tid).append("<span class='checkboxgroud'>" + t_value[$scope.value] + "</span>");

            } else {
              $element.find("#" + $scope.tid).append("<span class='checkboxgroud'>" + t_value[$scope.value] + ",</span>");
            }
          }
        }


        $element.find("#" + $scope.pid).off("change");
        $element.find("#" + $scope.pid).on("change", "input[type='checkbox']", function () {
          var $this = $(this);
          var result = $this.prop("checked");
          var value = $this.attr("value");
          if (result) {//选择
            $scope.check_arr.push(value);
          } else {//取消选择
            $scope.check_arr.remove(value);
          }
          $scope.checkModel = $scope.check_arr.join(",");
          $scope.$apply();

        });
      }

      //查询对应的value
      $scope.findValue = function (key) {
        if ($scope.$currentData) {
          for (var i = 0; i < $scope.$currentData.length; i++) {
            if ($scope.$currentData[i][$scope.key] == key) {
              return $scope.$currentData[i];
            }
          }
        }
      };
      $scope.test = function () {
        $("#" + $scope.pid).modal('show');
      }

      $scope.close = function () {
        $("#" + $scope.pid).modal('hide');
      }

      $scope.sure = function () {
        var sear_code = "";
        var sear_value = "";

        for (var i = 0; i < $scope.search_list.length; i++) {

          sear_code += $scope.search_list[i].split(',')[1] + ",";
          sear_value += $("#" + $scope.search_list[i].split(',')[1]).val() + ",";

        }
        //$scope.check_arr = [];
        //$element.find("#" + $scope.tid).empty();
        $scope.check_arr.length = 0;
        $scope.searchCondition = {
          sear_code: sear_code,
          sear_value: sear_value,
        };
        var postData = $scope.searchCondition;

        common_service.list2(postData, $scope.action).success(
          function (responseData) {
            $scope.$currentData = responseData;
            if ($scope.$currentData) {

              $scope.createDom();

            }
          }
        ).error(function (data, status, headers, config) {
          alert("连接错误，错误码：" + status);
        });
      }

      $scope.mySplit = function (string, nb) {
        var array = string.split(',');
        return array[nb];
      }
    }
  }
});


myDirectiveModule.directive('radiogroup', function () {
  return {
    restrict: 'A',
    scope: {
      checkModel: "=",
      action: "@",
      key: "@",
      value: "@",
      fields: "@",
      heads: "@",
      searchs: "@",
    },
    templateUrl: "views/_radiogroup.html",
    link: function ($scope, $element, $attrs, common_service) {//链接函数
      //监控数据模型的变化
      $scope.$watch("checkModel", function (newValue, oldValue, scope) {
        $scope.initDom();
      });
      $scope.$watch("$currentData", function (newValue, oldValue, scope) {
        if (newValue) {
          $scope.initDom();
        }
      });
      //初始时，链接对应的DOM结构
      $scope.initDom();

    },

    controller: function ($scope, $element, $attrs, $transclude, common_service) {//指令的控制器

      if (!$scope.$currentData) {
        common_service.list($scope.action).success(
          function (responseData) {
            $scope.$currentData = responseData;
          }
        ).error(function (data, status, headers, config) {
          alert("连接错误，错误码：" + status);
        });
      }
      $scope.tid = "T" + GUID();
      $scope.pid = "F" + GUID();
      $scope.head_list = $scope.heads.split(",");
      $scope.fields_list = $scope.fields.split(",");
      if ($scope.searchs != undefined) {
        $scope.search_list = $scope.searchs.split(";");
      }

      $scope.check_arr = [];
      //初始化dom,如果dom不存在
      $scope.initDom = function () {
        if ($scope.$currentData) {
          $scope.createDom();

        }
      }

      $scope.createDom = function () {
        $element.find("#" + $scope.tid).empty();
        //初始显示值
        if ($scope.checkModel) {
          var t_checkes = $scope.checkModel.split(",");
          $scope.check_arr = t_checkes;
        } else {
          $scope.check_arr = [];
          var t_checkes = [];
        }
        for (var i = 0; i < t_checkes.length; i++) {
          var t_key = t_checkes[i];//获取key
          var t_value = $scope.findValue(t_key);
          if (t_value) {
            if (i == t_checkes.length - 1) {
              $element.find("#" + $scope.tid).append("<span class='checkboxgroud'>" + t_value[$scope.value] + "</span>");

            } else {
              $element.find("#" + $scope.tid).append("<span class='checkboxgroud'>" + t_value[$scope.value] + ",</span>");
            }
          }
        }


        $element.find("#" + $scope.pid).off("change");
        $element.find("#" + $scope.pid).on("change", "input[type='radio']", function () {
          var $this = $(this);
          var result = $this.prop("checked");
          var value = $this.attr("value");

          $scope.checkModel = value;
          $scope.$apply();

        });
      }

      //查询对应的value
      $scope.findValue = function (key) {
        if ($scope.$currentData) {
          for (var i = 0; i < $scope.$currentData.length; i++) {
            if ($scope.$currentData[i][$scope.key] == key) {
              return $scope.$currentData[i];
            }
          }
        }
      };
      $scope.test = function () {
        $("#" + $scope.pid).modal('show');
      }

      $scope.close = function () {
        $("#" + $scope.pid).modal('hide');
      }

      $scope.sure = function () {
        var sear_code = "";
        var sear_value = "";

        for (var i = 0; i < $scope.search_list.length; i++) {

          sear_code += $scope.search_list[i].split(',')[1] + ",";
          sear_value += $("#" + $scope.search_list[i].split(',')[1]).val() + ",";

        }
        //$scope.check_arr = [];
        //$element.find("#" + $scope.tid).empty();
        $scope.check_arr.length = 0;
        $scope.searchCondition = {
          sear_code: sear_code,
          sear_value: sear_value,
        };
        var postData = $scope.searchCondition;

        common_service.list2(postData, $scope.action).success(
          function (responseData) {
            $scope.$currentData = responseData;
            if ($scope.$currentData) {

              $scope.createDom();

            }
          }
        ).error(function (data, status, headers, config) {
          alert("连接错误，错误码：" + status);
        });
      }

      $scope.mySplit = function (string, nb) {
        var array = string.split(',');
        return array[nb];
      }
    }
  }
});


/!*
 shangyin
 *!/

myDirectiveModule.directive('shangyin', function ($http, $q,$compile) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: {
      bound: "@",//
      triggers: "@",
      checkrules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@",
      src: "@"
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      //解析property
      scope.$execute();
      scope._parent= _$util.getParent(scope);
      var _billkey=scope._parent.scope.$parent._env.billkey;
      $http.post(baseUrl + scope.src+_billkey+"?isMobile=true&userInformation="+userInfo).success(function (ret) {
        if(ret.status == 1 && ret.billInfo.length > 0){
          scope.dsArr=ret.billInfo;
        }else{
          element.hide();
        }
      });
      var html="<li ng-repeat='x in dsArr' ng-click='getBills(x.key,x.type,x.ruleKey)'><a>{{x.name}}</a></li>"
      var el=$compile(html)(scope);
      element.find('.dropdown-menu').html(el);
      /!*  type:bill  请求叙事薄
       detail  明细
       multi  多样式表单
       *!/
      scope.getBills=function (billkey,type,ruleKey) {
        scope._type=type;
        scope._billkey=billkey;
        scope._ruleKey=ruleKey;
        var _src='';
        var _btn="";
        if(type=='DETAILS'||type=='MULTI') {
          _src = "/bill/view/multibill?billKey=" + billkey;
        }else {
          _src="/bill/view/bills?billKey="+billkey;
        }
        _btn = "<button class='btn btn-success' ng-click=\"test('" + billkey + "')\">确定</button>";

        var _iframe='<iframe id="parentPage" src='+_src+' width="100%" height="400px" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="auto" allowtransparency="yes"></iframe>'
        var dom = $compile(_iframe)(scope);
        scope._btn=$compile(_btn)(scope);
        $('#myModal .modal-body').html(dom);
        $('#myModal .modal-footer').html(scope._btn);
        $('#myModal').modal('show');
      };
      //
      scope.test=function (billkey) {
        var subscope= document.getElementById("parentPage").contentWindow.angular.element("#"+billkey).scope();
        subscope.refCreateTarget("PULL",{'billKey':scope._parent.scope._env._$parent.billkey,'pullType':scope._type,'ruleKey':scope._ruleKey});
      };
      //
    }
  }
});

myDirectiveModule.directive('xiatui', function ($http, $q,$compile) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: false,
    link: function (scope, element, attrs, ngModel) {//链接端函数
      element.removeAttr("disabled");
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      //解析property
      scope.$execute();
      scope._parent= _$util.getParent(scope);
      var _billkey=scope._parent.scope._env.billkey;
      $http.post(baseUrl + attrs.src+_billkey+"?isMobile=true&userInformation="+userInfo).success(function (ret) {
        if(ret.status==0){
          element.hide();
        }
        element.removeAttr("disabled")
      });
    }
  }
});



/!**
 * 文件上传控件：注意：files与控制器中的myfile绑定
 *    <div ng-controller=;"testupController" >
 <div upload  files="main.myfile" count="1"/>


 </div>
 *
 *!/
myDirectiveModule.directive('upload', function () {
  return {
    restrict: 'A',
    scope: {
      count: "@",
      files: "="//必须指定这个属性，文件采用“|”方式分隔，因为文件命名规则中不能使用这个，而逗号可能会导致错误

    },
    templateUrl: "views/_upload.html",
    link: function ($scope, $element, $attrs) {
      //当有数据变化时，添加对应的DOM列表
      $scope.$watch("files", function (newValue, oldValue, scope) {
        if ($scope.count && newValue) {//如果计数存在
          if (newValue.split("|").length >= $scope.count){
            $element.find("input").prop("disabled", "disabled")
          }
          else{
            $element.find("input").prop("disabled", "")
          }
        }

        if (newValue) {
          //$element.find("input").prop("disabled","disabled")
          $scope.initDom();
        }else{
          $element.find("input").prop("disabled", "");
        }
      });
      //初始时，链接对应的DOM结构
      $scope.initDom();

    },
    controller: function ($scope, $element, $attrs, $transclude) {//指令的控制器
      $scope.files_arr = [];
      $scope.tid = "T" + GUID();
      $scope.fid = "F" + GUID();
      $scope.modalLoading = "M" + GUID();


      $scope.initDom = function () {
        if ($scope.files && $scope.files.length > 0) {
          $scope.files_arr = $scope.files.split("|");
          $element.find(".datarow_").remove();
          for (var i = 0; i < $scope.files_arr.length; i++) {
            // $element.find("table").append($("<tr class='datarow_'><td align='center'><a href='/upload/" + $scope.files_arr[i] + "' target='_blank'>" + $scope.files_arr[i] + "</a></td><td><button type='button' class='am-btn am-btn-primary  am-btn-xs' filename='" + $scope.files_arr[i] + "'>删除</button></td></tr>"));
            $element.find("table").append($("<tr class='datarow_'><td align='center'><a href='" + $scope.files_arr[i] + "' target='_blank'>" + $scope.files_arr[i] + "</a></td><td><button type='button' class='am-btn am-btn-primary  am-btn-xs' filename='" + $scope.files_arr[i] + "'>删除</button></td></tr>"));
          }
        }
        $element.on("click", "button", function () {
          var filename = $(this).attr("filename")
          $(this).parent().parent().remove();
          $scope.del(filename);//调用
        });
      };
      $scope.test = function () {
        //tid,fid,preSend,sucess,fail,del,ext
        __$AjaxUpload($scope.tid, $scope.fid, $scope.preSend, $scope.sucess, $scope.fail, $scope.del);
      };
      $scope.preSend = function () {
        $("#" + $scope.modalLoading).modal("show");
      };
      $scope.sucess = function (result) {
        $("#" + $scope.modalLoading).modal("hide");
        if (result.status == 1) {
          var filename = result.filename;
          $scope.addfiles(filename);
        } else {
          alert(result.message);//打印出错误信息
        }
      };

      $scope.fail = function () {
        alert("网络问题，文件发送失败.");
        $("#" + $scope.modalLoading).modal("hide");
      };

      $scope.del = function (filename) {
        $scope.delfiles(filename);
      };

      $scope.addfiles = function (filename) {
        $scope.files_arr.push(filename);
        $scope.files = $scope.files_arr.join("|");

        $scope.$apply();


      };
      $scope.delfiles = function (filename) {
        $scope.files_arr.remove(filename);
        $scope.files = $scope.files_arr.join("|");
        $scope.$apply();
      }

    }
  };
});


/!**
 * billwfoperatorform
 *   工作流操作表单
 *
 *
 *!/
myDirectiveModule.directive('billwfoperatorform', function ($http, $q,$compile,$rootScope,commonService) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    template: "<div class=\"workbooksubNav clearfix\"><ul><li ng-repeat=\"x in dataArray\" ng-class=\"{'curr':x.ngcontroller==isActive}\"><a href=''  ng-click=\"changeTab(x)\">{{x.caption}}</a> </li></ul></div>",
    scope: {
      taskInstance: "@"
    },
    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      //taskInstance   task-instance
      if(!scope.taskInstance){
        alert("taskInstance null.");
      }
      scope.requestOperatorForm=function(){
        var envelop = new Envelop("workform");
        envelop.body.taskInstance = scope.taskInstance;

        commonService.sendEnvelop(baseUrl + "/bill/appView/workform", envelop).then(function (result) {
          var ret = eval("("+result.data+")");
          if(ret && ret != ''){
            scope.dataArray = new Array();
            for(var i=0;i<ret.length;i++){
              var html='<div class="workbookWrap">'+ret[i].html+'</div>';
              var _caption=$(html).find("div[Caption]");
              var _ngcontroller=$(html).find("div[ng-controller]");
              var dataAttr ={
                caption:$(_caption).attr('Caption'),
                ngcontroller:$(_ngcontroller).attr('ng-controller')
              };
              scope.dataArray.push(dataAttr);

              var fun= new Function("$scope", "$http", "$interval", "$rootScope", "$compile", "$q", ret[i].controller);
              controllerProvider.register("xyyerp."+ret[i].controllerName, fun);
              var inject=element.injector();
              inject.invoke(function($compile, $rootScope) {
                element.append($compile(html)($rootScope));//追加dom结构
              });
              $('#toolbox').remove();
              $("#operatorFormDiv div[BillType]").hide();
              $("#operatorFormDiv div[BillType]").eq(0).show();
              $("#operatorFormDiv").show();
            }
            scope.isActive=scope.dataArray[0].ngcontroller;
          }else{
            var _html="<div class='noData'>暂无操作表单</div>"
            element.append(_html);
          }
        },function(err){
          alert("请求数据表单失败."+err);
        });

      };
      scope.requestOperatorForm();

      scope.changeTab=function (tab) {
        scope.isActive=tab.ngcontroller;
        $("#operatorFormDiv div[BillType]").hide();
        $("#operatorFormDiv div[ng-controller='"+tab.ngcontroller+"']").show();
      };
      //
    }
  }
});

/!**
 * billwfdataforms
 * 工作流数据表单
 *!/
myDirectiveModule.directive('billwfdataforms', function ($http, $q,$compile,commonService,Common) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    template: "<div class=\"workbooksubNav clearfix\"><ul><li ng-repeat=\"x in dataArray\" ng-class=\"{'curr':x.ngcontroller==isActive}\"><a href=''  ng-click=\"changeTab(x.ngcontroller)\">{{x.caption}}</a> </li></ul></div>",
    scope: {
      taskInstance: "@"
    },
    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      //taskInstance   task-instance
      if(!scope.taskInstance){
        alert("taskInstance null.");
      }
      scope.requestOperatorForm=function(){
        var envelop = new Envelop("dataforms");
        envelop.body.taskInstance = scope.taskInstance;
        commonService.sendEnvelop(baseUrl + "/bill/appView/dataforms", envelop).then(function (result) {
          var ret = eval("("+result.data+")");
          if(ret && ret != ''){
            scope.dataArray = new Array();
            for(var i=0;i<ret.length;i++){
              var html='<div class="workbookWrap">'+ret[i].html+'</div>';

              var billtype=ret[i].billtype;
              var _caption=$(html).find("div[Caption]");
              var _ngcontroller=$(html).find("div[ng-controller]");
              var dataAttr ={
                caption:$(_caption).attr('Caption'),
                ngcontroller:$(_ngcontroller).attr('ng-controller')
              };
              scope.dataArray.push(dataAttr);

              var fun= new Function("$scope", "$http", "$interval", "$rootScope", "$compile", "$q", ret[i].controller);
              controllerProvider.register("xyyerp."+ret[i].controllerName, fun);
              var inject=element.injector();
              inject.invoke(function($compile, $rootScope) {

                if(billtype=='dic'){
                  Common.loadScript('lib/js/dictionary.js', function () {
                    element.append($compile(html)($rootScope));//追加dom结构
                    $(element).find("#toolbox").remove();
                  });
                }else if(billtype=='bill'){
                  Common.loadScript('lib/js/bill.js', function () {
                    element.append($compile(html)($rootScope));//追加dom结构
                    $(element).find("#toolbox").remove();
                  });
                }else if(billtype=='multibill'){
                  Common.loadScript('lib/js/multiBill.js', function () {
                    element.append($compile(html)($rootScope));//追加dom结构
                    $(element).find("#toolbox").remove();
                  });
                }


              });


              $("#dataFormDiv div[BillType]").hide();
              $("#dataFormDiv div[BillType]").eq(0).show();
              $("#dataFormDiv").show();
            }
            scope.isActive=scope.dataArray[0].ngcontroller;
          }else{
            var _html="<div class='noData'>暂无数据表单</div>"
            element.append(_html);
          }
        },function(err){
          alert("请求数据表单失败."+err);
        });
      };
      scope.requestOperatorForm();

      scope.changeTab=function (tab) {
        scope.isActive=tab;
        $("#dataFormDiv div[BillType]").hide();
        $("#dataFormDiv div[ng-controller='"+tab+"']").show();
      }
    }
  }
});


//jsdecoder
myDirectiveModule.directive('jsdecoder', function ($http, $q,$compile,Common) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    scope: false,
    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用
      //混合器，指令初始代码
      mixer(abstractDirective, scope);
      //解析property
      scope.$execute();

      scope._parent= _$util.getParent(scope);

      var jsdecoder;
      var code = '';
      scope.ngModel.$viewChangeListeners.push(function () {
        jsdecoder = new JsDecoder();
        jsdecoder.s = ngModel.$modelValue;
        try {
          code = jsdecoder.decode();
          console.log(code);
          ngModel.$setViewValue(code);
          ngModel.$render();
        } catch (e) {
          alert(JSON.stringify(e));
        }
      });

    }
  }
});

// 树 xyyztree
myDirectiveModule.directive('xyyztree', function ($http, $q, Common) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    // template: "<div class=\"ztree\" treemodel=\"treemodel\" treeoptions=\"treeoptions\" ></div>",
    scope: {
      bound: "@",//
      triggers: "@",
      checkRules: "@",
      init: "@",
      formatters: "@",
      properties: "@",
      key: "@",
      renderid: "@",
      tableKey: "@",
      treeoptions: "=",
      treemodel: "=",
      multiselect: "@",
      onSelection:"&",
      broadcastName:"@"
    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      scope.ngModel = ngModel;//模型应用
      scope.$q = $q;//$q引用
      scope.$http = $http;//$http引用

      scope._$curTreeNode = null;
      //混合器，指令初始代码
      // mixer(abstractDirective, scope);
      ////树节点click的时候抛出事件以及当前节点
      scope.zTreeOnClick = function (event, treeId, treeNode) {
        var _treeNode = scope.tree.getSelectedNodes();
        scope.$emit(scope.broadcastName,_treeNode);
        //向上冒泡，广播名称由指令行上定义名称；
        scope.$apply(function () {
          //将当前选中的节点放到ngModel中，控制器中直接取当前的ngModel
          if (!scope._$curTreeNode || scope._$curTreeNode.tId != _treeNode) {
            scope.ngModel.$setViewValue(_treeNode);
            scope._$curTreeNode = _treeNode;
          }

        });
      };
      //删除节点确认，具有子节点的节点禁止删除。
      scope.zTreeBeforeRemove = function (treeId, treeNode) {
        if (treeNode.children && treeNode.children.length > 0) {
          alert('子节点不为空，禁止删除');
          return false;
        } else {
          return confirm("确定删除" + treeNode.name + " ？")
        }
      };
      //重命名节点 回调函数
      scope.zTreeOnRename = function (event, treeId, treeNode, isCancel) {

      };

      //拖拽结束事件
      scope.onDrop = function (event, treeId, treeNodes, targetNode, moveType) {
        var parent = _$util.getParent(scope);
        var entityKey = "$t_" + scope.tableKey;
        parent.scope._model[entityKey] = scope.tree.getNodes();
      };

      //拖拽放下前事件
      scope.beforeDrop = function (treeId, treeNodes, targetNode, moveType) {
        if (moveType == 'inner' && targetNode.nodeType == '2') {
          alert(targetNode.name + '为明细节点，不能移入')
          return false;
        }
      };

      //tree
      //    树默认配置，可在控制器中覆盖默认配置

      scope.treemodel = [];
      //设置是否允许多选
      var _multiselect = false;
      if (attrs.multiselect == 'true') {
        _multiselect = true;
      } else {
        _multiselect = false;
      };
      scope.treeoptions = {
        view: {
          selectedMulti: _multiselect
        },
        edit: {
          drag: {
            autoExpandTrigger: true,
          },
          enable: true,
          showRemoveBtn: false,
          showRenameBtn: false
        },
        check: {
          enable: false,
          autoCheckTrigger: true,
          chkStyle: "checkbox",
          radioType: "all",    // "level" 时，在每一级节点范围内当做一个分组。radioType = "all" 时，在整棵树范围内当做一个分组。
          chkboxType: {"Y": "ps", "N": "ps"}
        },
        data: {
          simpleData: {
            enable: true
          }
        },
        callback: {
          onClick: scope.zTreeOnClick,
          beforeRemove: scope.zTreeBeforeRemove,
          onRename: scope.zTreeOnRename,
          onDrag: scope.onDrag,
          onDrop: scope.onDrop,
          beforeDrop: scope.beforeDrop,
          onExpand: scope.onExpand

        }
      };


      //递归,初始化的时候回显selected
      function _initSelected(node) {
        // status   :  0 禁用  1可用
        if (node && node.length) {
          // var _tid=node[j].tId;
          // angular.element(_tid).addClass();
          for (var j = 0; j < node.length; j++) {
            scope.setTreeClass(node[j]);
            var _childs = node[j].children;
            if (_childs.length > 0) {
              for (var i = 0; i < _childs.length; i++) {
                _initSelected(_childs[i]);
              }
            }
          }
        } else {
          scope.setTreeClass(node);
          var _childs = node.children;
          if (_childs.length > 0) {
            for (var i = 0; i < _childs.length; i++) {
              _initSelected(_childs[i]);
            }
          }
        }
        //
      };

      scope.setTreeClass = function (node) {
        // 0:草稿  10：启用   20：禁用   30：删除
        var _tid = node.tId + '_a';
        if (node.status == 0) {
          angular.element('#' + _tid).addClass('disabled');
        } else if (node.status == 20) {
          angular.element('#' + _tid).addClass('draft');
        }
      };

      //树初始化
      scope._initTree = function () {
        $.fn.zTree.init(element, scope.treeoptions, scope.treemodel);
        var treeID = attrs.id;
        var _nodes = scope.treemodel;
        scope.tree = $.fn.zTree.getZTreeObj(treeID);
        var __node = scope.tree.getNodes();
        scope.getSelectedNodes = function () {
          return scope.tree.getSelectedNodes();
        };
        scope.getCheckedNodes = function () {
          return scope.tree.getCheckedNodes();
        };
        scope.selectNode = function (node, addFlag, isSilent) {
          return scope.tree.selectNode(node, addFlag, isSilent);
        };
        scope.getNodes = function () {
          return scope.tree.getNodes();
        };
        // _initSelected(__node);
      };

      //默认不初始化树，在控制器中进行调用load初始化。
      scope.loadTree = function () {
        if (typeof $.fn.zTree != 'undefined') {
          scope._initTree();
        } else {
          try {
            Common.loadCss('css/zTreeStyle/zTreeStyle.css', null);
            Common.loadScript('js/jquery.ztree.all.js', function () {
              scope._initTree();
            });
          } catch (e) {
            alert('树资源没有正确加载！')
          }
        }
      };

      scope.bindRowsModel = function () {
        scope.loadTree();
      };

      scope.$on('$_MODEL_CHANGE_$', function (e, model) {
        scope.bindRowsModel();
      });
    }
  }
});


//
myDirectiveModule.directive('billuiviewdocker', function ($http, $q, $compile,commonService,Common) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    // template: "<div class=\"ztree\" treemodel=\"treemodel\" treeoptions=\"treeoptions\" ></div>",
    scope: {

    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      var billInfo=localStorage.getItem('dockerBillInfo');

      if(!billInfo && billInfo==''){
        alert("单据模型不完整");
        return;
      }
      scope.arr=billInfo.split("?");
      scope.arr1=scope.arr[0].split("/");
      scope.arr2=scope.arr[1].split("&");
      scope.billType=scope.arr1[2];
      scope.billKey=scope.arr2[0].substring(8);

      var html="<div billuiviewdockertest  />";

      if(scope.billType=='dics'){
        Common.loadScript('lib/js/dictionary.js', function () {
          element.append($compile(html)(scope));//追加dom结构
        });
      }else if(scope.billType=='bills'){
        Common.loadScript('lib/js/bill.js', function () {
          element.append($compile(html)(scope));//追加dom结构
        });
      }else if(scope.billType=='multibill'){
        Common.loadScript('lib/js/multiBill.js', function () {
          element.append($compile(html)(scope));//追加dom结构
        });
      }

    }
  }
});


myDirectiveModule.directive('billuiviewdockertest', function ($http, $q, commonService,$compile,$rootScope) {
  return {
    require: '?ngModel',
    restrict: 'EA',
    // template: "<div class=\"ztree\" treemodel=\"treemodel\" treeoptions=\"treeoptions\" ></div>",
    scope: {

    },

    link: function (scope, element, attrs, ngModel) {//链接端函数
      var billInfo=localStorage.getItem('dockerBillInfo');

      if(!billInfo && billInfo==''){
        alert("单据模型不完整");
        return;
      }
      scope.arr=billInfo.split("?");
      scope.arr1=scope.arr[0].split("/");
      scope.arr2=scope.arr[1].split("&");
      scope.billType=scope.arr1[2];
      scope.billKey=scope.arr2[0].substring(8);

      var envelop = new Envelop("forms");
      envelop.body.billType =  scope.billType;
      envelop.body.billKey = scope.billKey;

      commonService.sendEnvelop(baseUrl + "/bill/appView/forms", envelop).then(function (ret) {
        var ret=eval(ret.data);
        var html=ret[0].html;
        var fun = new Function("$scope"
          , "$http", "$interval", "$rootScope", "$compile", "$q", ret[0].controller);
        controllerProvider.register("xyyerp." + ret[0].controllerName, fun);
        var inject = element.injector();
        inject.invoke(function ($compile, $rootScope) {
          element.append($compile(html)($rootScope));//追加dom结构
        });

      },function(err){

      });
    }
  }
});*/





function GUID() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
};

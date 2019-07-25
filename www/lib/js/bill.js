window.ERPBill = {
  /*
   文件导出
   */
  downloadExcel: function (entityKey) {
    var me = this;
    var reqParams = {};
    clone(this._env, reqParams);
    var source = [];
    for(model in me._model){
      if(model=='_$parent') continue;
      if(me._model[model].sos && me._model[model].sos.length>0){
        for(var i=0;i<me._model[model].sos.length;i++){
          me._model[model].sos[i].$key=model;
        }
        source.push(me._model[model].sos);
      }
    }
    if(entityKey){
      var mode={};
      mode[entityKey]={
        page:me._model[entityKey].page,
        params:me._model[entityKey].params
      };
      reqParams["model"]=angular.toJson(mode);
    }
    console.log(source);
    reqParams._source = angular.toJson(source);
    reqParams.optExcel = "download";
    this.$http.post("/bill/parseExcel/" + reqParams.billtype.toLowerCase(), $.param(reqParams),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).success(function (data) {
      if (data.status == '1') {
        window.location.href = "/bill/download?path=" + data.path;
        alert("文件导出成功！")
      } else {
        alert("文件导出失败,原因" + data.error);
        return;
      }
    }).error(function (err) {
      alert("文件导出失败,原因:" + err);
      return;
    });
  },

  /**
   * 发票数据推送
   */
  billDataPush: function(head,details){
    var params = [];
    params.push({djHead:head,djMx:details});
    $.ajax({
      url: 'http://127.0.0.1:9111/suiwu/sendDataToSuiWu',
      type: 'POST', //GET
      async: false,    //或false,是否异步
      data: {suiwuBill: JSON.stringify(params)},
      timeout: 60000,    //超时时间
      dataType: 'json',    //返回的数据格式：json/xml/html/script/jsonp/text
      success: function (data, textStatus, jqXHR) {
        $("#lablePlay").html(data.result);
        alert("发票数据推送成功！");
        return;
      },
      error: function (xhr, textStatus) {
        alert(textStatus);
      },
      complete: function () {
        console.log('结束')
      }
    });

  },

  /*
   单据保存
   */
  save: function (type, fn) {
    NProgress.start();
    var me = this;
    //判断错误信息

    function delErr(_err) {
      var i = me.errList.length;
      while (i--) {
        if (me.errList[i].key == _err.key) {
          me.errList.splice(i, 1);
        }
      }
    }

    for (var i = 0; i < me.checkRuleLists.length; i++) {
      var _key = me.checkRuleLists[i].key;
      var _value = getHeadValue(_key);
      try {
        var _rule = eval(me.checkRuleLists[i].rule[0].rule);
        var _rst = _rule.test(_value);
      } catch (e) {
        alert(JSON.stringify(e));
      }
      if ((_rst == false || _value == undefined)) {
        $("[key=" + _key + "]").focus();
      }else{
        delErr(me.checkRuleLists[i]);
      };
    };
    if (me.errList.length > 0) {
      var __key = me.errList[0].key;
      alert("请填写正确信息");
      $("[key=" + __key + "]").focus();
      NProgress.done();
      return;
    };

    var postData = {};
    var tag = true;
    var _errMsg = [],
      _warnMsg = []


    angular.forEach(me._model, function (data) {
      if (data.head == false) {
        _errMsg[data.key] = [];
        _warnMsg[data.key] = [];

        //保存之前过滤空行信息
        var i = data.cos.length;
        while (i--) {
          if (data.cos[i].isNullRow == true) {
            data.cos.delByValue(data.cos[i]);
          }
        };

        //保存之前过验证是否可以保存空行
        if (!data.canSaveNull || data.canSaveNull == false) {
          if (data.cos.length <= 0) {
            alert('数据明细不能为空');
            tag = false;
            NProgress.done();
            return false;
          }
        };

        //获取规则验证错误信息
        if (me._env.rules && me._env.rules[data.key] && me._env.rules[data.key] !== '') {
          for (var i = 0; i < me._env.rules[data.key].length; i++) {
            _errMsg[data.key].push(me._env.rules[data.key][i].errorMsg);
            if (me._env.rules[data.key][i].waring) {
              _warnMsg[data.key].push(me._env.rules[data.key][i].waring.waringMsg);
            }
          }
          ;
          postData[data.key] = {models: data.cos, rules: me._env.rules[data.key]};
        }
      }
    });


    //验证错误信息end
    if (this._model) {
      //保存之前执行before事件
      //解析fn方法
      if (fn.before) {
        var _before = fn.before;
        for (var p in _before) {
          var _fn = p + "(" + _before[p].join(",") + ")";
          eval(_fn);
        }
      }
      ;

      var reqParams = {};
      clone(this._env, reqParams);
      reqParams.model = angular.toJson(this._model);
      var _$sourceBill = window.localStorage.getItem("_$sourceBill");
      try {
        if (_$sourceBill) {
          reqParams.model = _$sourceBill;
        }
      } catch (error) {
        alert(error);
      } finally {
        window.localStorage.removeItem("_$sourceBill");
      }
      ;

      var _save = function (reqParams) {

        //
        me.$http.post(baseUrl+"/bill/data/bill-save", $.param(reqParams),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
          }).success(function (data) {
          NProgress.done();
          if (data.status == '1') {
            alert("数据保存成功！");
            if (type && type == 'bills') {
              window.location.href = "/bill/view/bills?billKey=" + me._env.billkey;
            } else {
              window.location.href = "/bill/view/bill?billKey=" + me._env.billkey + "&BillID=" + data.billID;
            }
            ;
            //执行after方法
            if (fn.before) {
              var _after = fn.after;
              for (var p in _after) {
                var _fn = p + "(" + _after[p].join(",") + ")";
                eval(_fn);
              }
            }
            ;
          } else {
            var error = JSON.parse(data.error);
            var _err = [];
            for (var i = 0; i < error.length; i++) {
              _err.push(error[i].message);
            }
            ;
            _err.join(",");
            alert("单据保存失败,原因：" + _err);
            return;
          }
        }).error(function (err) {
          NProgress.done();
          alert("单据保存失败,原因：" + err);
          return;
        });
      };


      if (JSON.stringify(postData) != "{}") {
        me.$http.post(baseUrl+"/bill/data/rule", $.param({postData: JSON.stringify(postData)}),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
          }).success(function (ret) {
          NProgress.done();
          var flag = true;
          for (i in ret.result) {
            var data = ret.result[i];
            if (data.errorModels.length > 0 || data.warnModels.length > 0) {
              if (data.mes && data.mes !== '') {
                alert(data.mes);
              } else {
                if (data.warnFlag) {
                  alert(_errMsg[i][0]);
                } else {
                  alert(_warnMsg[i][0]);
                }
              }
              // alert('您保存的行信息不合格');
              flag = false;
              return false;
            }
          }
          if (flag) {
            _save(reqParams);
          }
        }).error(function (err) {
          NProgress.done();
          alert("请求失败" + err);
        });
      } else if (tag) {
        _save(reqParams);
      }

    }
  },
  /*  暂时保留
   单据保存回写
   */
  saveForWF: function (scopes) {
    var me = this;
    //判断错误信息
    var scopeParam = [];
    for (var i = 0; i < scopes.length; i++) {
      var scopeEnv = {};
      var me = scopes[i];
      clone(me._env, scopeEnv);
      scopeEnv.model = angular.toJson(me._model);
      scopeParam.push(scopeEnv);
      for (var j = 0; j < me.checkRuleLists.length; i++) {
        var _key = me.checkRuleLists[j].key;
        $("[key=" + _key + "]").focus();
      };
      if (me.errList.length > 0) {
        alert("请填写正确信息");
        break;
      }
    };
    //验证错误信息end
    if (this._model) {
      var reqParams = {};
      clone(this._env, reqParams);
      reqParams.model = angular.toJson(this._model);
      this.$http.post(baseUrl+"/bill/data/bill-save", $.param({scopeParam: angular.toJson(scopeParam)}),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        }).success(function (data) {
        if (data.status == '1') {
          alert("单据保存成功");
        } else {
          alert("单据保存失败,原因" + data.error);
          return;
        }
      }).error(function (err) {
        alert("单据保存失败,原因:" + err);
        return;
      });
    }
  },
  /*
   单据新增
   */
  add: function () {
    var me = this;
    var parent = _$util.getParent(this);
    if (!parent.scope._model) {
      alert("父模型构建不完整.");
      return;
    }
    window.location.href = '/bill/view/bill?billKey=' + me._env.billkey;
  },
  /*
   单据编辑
   */
  edit: function () {
    var me = this;
    var parent = _$util.getParent(this);
    if (!parent.scope._model) {
      alert("父模型构建不完整.");
      return;
    }
    var keyArray = me._env.billkey.split('_');
    var Bills = me._model[keyArray[keyArray.length - 1]].sos;
    if (Bills.length != 1) {
      alert("请选择一条单据");
      return;
    } else {
      var bill = Bills[0];
      if (bill.status !== 1) {
        alert('当前状态的单据不允许编辑！');
        return;
      }
      window.location.href = '/bill/view/bill?billKey=' + me._env.billkey + '&BillID=' + bill.BillID;
    }
  },

  //流程工作查看器
  process: function () {
    var me = this;
    var parent = _$util.getParent(this);
    if (!parent.scope._model) {
      alert("父模型构建不完整.");
      return;
    }
    var ti = me._env.billid;
    var req = {};
    clone(me._env, req);
    this.$http.post(baseUrl+"/bill/data/process", $.param(req),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).success(function (data) {
      if (data.status == '1') {
        window.location.href = "process#/view/doTask/" + data.ti + "/false";
      } else {
        alert(data.error);
      }
    }).error(function (err) {
      alert("打开失败,原因:" + err);
    });
  },
  /*
   返回
   */
  return: function () {
    var me = this;
    var parent = _$util.getParent(this);
    if (!parent.scope._model) {
      alert("父模型构建不完整.");
      return;
    }
    window.location.href = '/bill/view/bills?billKey=' + me._env.billkey;
  },
  /*
   删除
   */
  delete: function () {
    var me = this;
    var reqParams = {};
    clone(me._env, reqParams);
    var bills = me._model[reqParams.billkey].sos;
    if (bills.length == 0) {
      alert("请选择需要删除记录");
      return;
    }
    else {
      for (var i = 0; i < bills.length; i++) {
        if (bills[i].status != 1) {
          alert("该单据已经进入业务流程，不可删除");
          return;
        }
      }
    }
    // else{
    //     for(var i=0;i<bills.length;i++){
    //         if(bills[i].status!==20){
    //             alert("您选择的单据状态不可删除！");
    //             return;
    //         }
    //     }
    // }
    if (window.confirm('确认删除？')) {
      reqParams.bills = angular.toJson(bills);
      reqParams.status = -1;
      reqParams.billID = bills[0].BillID;
      this.$http.post(baseUrl+"/bill/data/bill-delete", $.param(reqParams),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        }).success(function (data) {
        if (data.status == '1') {
          window.location.href = "/bill/view/bills?billKey=" + me._env.billkey;
        } else {
          alert("单据保存失败,原因" + data.error);
        }

      }).error(function (err) {
        alert("单据删除失败,原因:" + err);
      });
    } else {
      return;
    }
  },
  /*
   分页
   */
  pageInit: function () {
    var cacheSkin = localStorage.getItem('skin');
    if (cacheSkin && cacheSkin !== '') {
      this.skinClass = cacheSkin;
    }
    //寻找我的父
    var parent = _$util.getParent(this);
    if (!parent.scope._model) {
      // alert("父模型构建不完整.");
    }


    this.__initCtrMethodCallback();
    NProgress.start();
    this.__load();
  },

  /**
   * 视图中调用控制器的方法：
   *        @$this.ctrlMethod();
   *    视图中调用主界面widget
   *        @$.widgetKey.method();
   * @private
   */
  __initCtrMethodCallback: function () {
    var me = this;
    this._$CACHE = createCache();
    //调用队列
    this.$on('$_INSTRUCTION_METHOD_CALL', function (e, param) {
      me._$CACHE.pushQueue({id: me._$CACHE.count(), data: param, count: 0});
    });

    //消息循环
    this.$interval(function () {
      var dels = [];
      for (var i = 0; i < me._$CACHE.queue().length; i++) {
        if (me._$CACHE.queue()[i].count > 1800) {
          dels.push(me._$CACHE.queue()[i]);
        } else {
          me._$CACHE.queue()[i].count += 1;
          me.$broadcast('$_INSTRUCTION_METHOD_CALLBACK', me._$CACHE.queue()[i]);
        }
      }
      for (var i = 0; i < dels.length; i++) {
        me._$CACHE.delQueue(dels[i]);
      }
    }, 10);

    //事件：$_INSTRUCTION_METHOD_CALLBACK
    this.$on('$_INSTRUCTION_METHOD_CALLBACK', function (e, param) {
      if (param.data.key == "$this") {//调用控制器中的方法
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
        me._$CACHE.delQueue(param);
      } else if (param.data.key == "$") {//调用主界面中widget中的方法
        var subkey = param.data.body.substring(1, param.data.body.indexOf("."));
        param.data.key = subkey;
        param.data.body = param.data.body.substring(subkey.length + 2);
        param.data.renderid = me.renderId;
      }
    });
  },
  __load: function (entityKey) {
    var me = this;
    var envelop = new Envelop("load");

    if (entityKey) {
      me._model[entityKey].sos.clear();
    }
    var url;
    if (me._env.billtype == "Bill") {
      url = "/bill/data/bill";
      var curModel = window.sessionStorage.getItem(me._env.billkey);
      if (curModel) {
        me.$interval(function () {
          me.__bind(JSON.parse(curModel));
        }, 100, 1);
        return;
      };
      window.sessionStorage.removeItem(me._env.billkey);
    } else if (me._env.billtype == "Bills") {
      url = "/bill/data/bills";
    } else {
      alert("页面类型异常");
      return;
    }
    var req = {};
    clone(me._env, req);
    envelop.body = req;

    if (entityKey) {
      var mode = {};
      mode[entityKey] = {
        page: me._model[entityKey].page,
        params: me._model[entityKey].params
      };

      req["model"] = angular.toJson(mode);
    }
    console.log(envelop);
    sendEnvelop(baseUrl + url, envelop).then(function (ret) {

      var ret = eval("("+ret.data+")");

      console.log(ret);
      if (ret.status == 0) {
        var error = JSON.parse(ret.error);
        alert(error[0].message + ",错误代码：" + error[0].errNo);
      } else if (ret.status == 1) {
        me.__bind(ret.data);
      } else if (ret.status == 2) {//正常返回，但没有数据
        console.log("no data.")
      } else {
        alert("位置异常");
      }
    });

    //
    // this.$http.post(baseUrl+url, data,
    //   {
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    //     }
    //   }).success(function (ret) {
    //   if (ret.status == 0) {
    //     var error = JSON.parse(ret.error);
    //     alert(error[0].message + ",错误代码：" + error[0].errNo);
    //   } else if (ret.status == 1) {
    //     me.__bind(ret.data);
    //   } else if (ret.status == 2) {//正常返回，但没有数据
    //     console.log("no data.")
    //   } else {
    //     alert("位置异常");
    //   }
    // }).error(function (err) {
    //   alert(err);
    // });

  },

  refresh: function (tableKey, data) {
    var entity = this._model[tableKey];
    if (entity) {
      entity.cos.splice(0, entity.cos.length);
      for (var i = 0; i < data.cos.length; i++) {
        entity.cos.push(data.cos[i]);
      }
      clone(data.page, entity.page);
    }
    this.$broadcast('$_MODEL_CHANGE_$', this._model);
  },

  __bind: function (data) {
    window.$body = [];
    for (var i = 0; i < data._models.length; i++) {
      var dataObject = data[data._models[i]];
      this._model[data._models[i]] = dataObject;

      dataObject.co = dataObject.cos[0];
      dataObject.sos = [];
      dataObject.dels = [];
      dataObject.archetype.shadowCol = [];
      if (dataObject.head) {
        this[data._models[i]] = dataObject.co;
        this["$" + data._models[i]] = dataObject;
        window.$head = dataObject.co;

      } else {
        if (dataObject.cos && dataObject.cos.length > 0) {
          for (var p = 0; p < dataObject.cos.length; p++) {
            dataObject.cos[p].shadowCol = [];
          }
        }
        window.$body[data._models[i]] = dataObject;
        this["__$" + data._models[i] + "$__"] == dataObject.cos;
        this["$" + data._models[i]] = dataObject;
      }
    }
    window.$model = this._model;
    var _$targetBill = window.localStorage.getItem("_$targetBill");
    var _$targetBillDetails = window.localStorage.getItem("_$targetBillDetails");

    try {
      if (_$targetBill) {
        var $targetBill = JSON.parse(_$targetBill);
        for (var i = 0; i < $targetBill._models.length; i++) {
          var entity = this._model[$targetBill._models[i]];//获取模型中的实体
          if (!entity) {
            continue;
          }
          if (entity.head) {
            entity.cos.clear();
            entity.cos.addAll($targetBill[$targetBill._models[i]].cos);
            entity.co = entity.cos[0];
            entity.sos = [];
            this[$targetBill._models[i]] = entity.co;
            this["$" + $targetBill._models[i]] = entity;
          } else {
            entity.cos.clear();
            entity.cos.addAll($targetBill[$targetBill._models[i]].cos);
            entity.co = entity.cos[0];
            entity.sos = [];
            this["__$" + $targetBill._models[i] + "$__"] == entity.cos;
            this["$" + $targetBill._models[i]] = entity;
          }
        }
      }
    } catch (error) {
      alert(error);
    } finally {
      window.localStorage.removeItem("_$targetBill");
    }

    try {
      if (_$targetBillDetails) {
        var $targetBillDetails = JSON.parse(_$targetBillDetails);
        for (var i = 0; i < $targetBillDetails._models.length; i++) {
          var entity = this._model[$targetBillDetails._models[i]];//获取模型中的实体
          if (!entity) {
            continue;
          }
          if (entity.head) {
            // entity.cos.clear();
            // entity.cos.addAll($targetBill[$targetBill._models[i]].cos);
            // entity.co=entity.cos[0];
            // entity.sos=[];
            // this[$targetBill._models[i]] = entity.co;
            // this["$"+$targetBill._models[i]]=entity;
          } else {
            entity.cos.clear();
            entity.cos.addAll($targetBillDetails[$targetBillDetails._models[i]].cos);
            entity.co = entity.cos[0];
            entity.sos = [];
            this["__$" + $targetBillDetails._models[i] + "$__"] == entity.cos;
            this["$" + $targetBillDetails._models[i]] = entity;
          }
        }
      }
    } catch (error) {
      alert(error);
    } finally {
      window.localStorage.removeItem("_$targetBillDetails");
    }

    NProgress.done();
    //发送修改广播
    this.$broadcast('$_MODEL_CHANGE_$', this._model);

  }

};

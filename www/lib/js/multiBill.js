window.ERPMultibill = {
    
    pageInit: function () {
        var cacheSkin=localStorage.getItem('skin');
        if(cacheSkin && cacheSkin!==''){
            this.skinClass=cacheSkin;
        }
        //寻找我的父
        var parent = _$util.getParent(this);
        if (!parent.scope._model) {
            alert("父模型构建不完整.");
        }
        this.__initCtrMethodCallback();
//        this.__loadMultiBillData();
        this.__load();
    },
    refCreateTarget:function(ruleType,bill){
        var me = this;
        var req={};
        req.billkey=me._env.billkey;
        var bills=me._model[me._env.billkey].sos;
        if(bills.length!=0){
            var sourceBillIDs = [];
            $.each(bills, function (index, entry) {
                sourceBillIDs.push(entry.BillDtlID);
            });
            req.sourceBillDtlIDs=angular.toJson(sourceBillIDs);
            req.sBillKey=me._env.billkey;
            req.tBillKey=bill.billKey;
            req.ruleType = ruleType;
            req.ruleKey = bill.ruleKey;
            var url ='';
            var targetBill='';
            if(bill.pullType=='DETAILS'){
                url="/bill/edge/details";
                targetBill='_$targetBillDetails';
            }else {
                url="/bill/edge/multiBill";
                req.model = angular.toJson(bills);
                targetBill='_$targetBill';
            }



            this.$http.post(url, $.param(req),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    }
                }).success(function (ret) {
                if(ret.status=='1'){
                    $('#myModal').modal('hide');
                    alert("转换成功.");
                    //多样式表单只有上引，上引完后跳转到目标单据
//                    if(ret.action=="go_target_bill_editor"){
                        // window.localStorage.setItem("_$sourceBill",JSON.stringify(ret.sourceData));
                        window.localStorage.setItem(targetBill,JSON.stringify(ret.datas));
                        if(ruleType=='PUSH'){
                            window.location.href="/bill/view/bill?billKey="+bill.billKey;
                        }else {
                            window.parent.location.href="/bill/view/bill?billKey="+bill.billKey;
                        }
                }else{
                    alert("单据保存失败,原因"+ret.error);
                }
            }).error(function (err) {
                alert("单据保存失败,原因:" + err);
            });
        }else{
            alert("请选择一行记录");
        }



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
        this._$CACHE=createCache();
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
                    me.$broadcast('$_INSTRUCTION_METHOD_CALLBACK',me. _$CACHE.queue()[i]);
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
        NProgress.start();
    	var me = this;
        if(entityKey){
            me._model[entityKey].sos.clear();
        }
        var req={};
        clone(me._env,req);
        if(entityKey){
        	 var mode={};
        	 mode[entityKey]={
             		page:me._model[entityKey].page,
             		params:me._model[entityKey].params
             };
             req["model"]=angular.toJson(mode);
        }
        
        this.$http.post("/bill/data/multibill", $.param(req),{
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
        }).success(function (ret) {
            if (ret.status == 0) {
                alert(ret.error);
            } else if (ret.status == 1) {
                me.__bind(ret.data);
            } else if (ret.status == 2) {//正常返回，但没有数据
                console.log("no data.")
            } else {
                alert("位置异常");
            }
        }).error(function (err) {
            alert(err);
        });
    },

    __bind: function (data) {
        for (var i = 0; i < data._models.length; i++) {
            var dataObject = data[data._models[i]];
            this._model[data._models[i]] = dataObject;
            dataObject.co = dataObject.cos[0];
            dataObject.sos = [];
            dataObject.dels = [];
            dataObject.archetype.shadowCol = [];
            if (dataObject.head) {
                this[data._models[i]] = dataObject.co;
                this["$"+data._models[i]]=dataObject;
            } else {
                if(dataObject.cos && dataObject.cos.length>0){
                    for(var p =0; p<dataObject.cos.length; p++){
                        dataObject.cos[p].shadowCol=[];
                    }
                }
                this["__$" + data._models[i] + "$__"] == dataObject.cos;
                this["$"+data._models[i]]=dataObject;
            }
        }
        NProgress.done();
        //发送修改广播
        this.$broadcast('$_MODEL_CHANGE_$', this._model);
    },
    
    /**
     * 分页事件
     */
    refresh:function(tableKey,data){
        var entity= this._model[tableKey];
        if(entity){
            entity.cos.splice(0,entity.cos.length);
            for(var i=0;i<data.cos.length;i++){
                entity.cos.push(data.cos[i]);
            }
            clone(data.page,entity.page);
        }
        this.$broadcast('$_MODEL_CHANGE_$', this._model);
    }
    
};
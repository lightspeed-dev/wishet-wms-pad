window.ERPDic={
		
	$add:function(){
        var me=this;
        var parent = _$util.getParent(this);
        if (!parent.scope._model) {
            alert("父模型构建不完整.");
            return;
        }
        window.location.href='/bill/view/dics-item?billKey='+me._env.billkey;
    },
    $edit:function(){
        var me=this;
        var parent = _$util.getParent(this);
        if (!parent.scope._model) {
            alert("父模型构建不完整.");
            return;
        }
        var Bills=me._model[me._env.billkey].sos;
        if(Bills.length!=1){
            alert("请选择一行记录");
            return ;
        }else if(Bills[0].status >=20){
            alert("单据审核中，不可编辑！");
            return ;
        }else{
            var bill=Bills[0];
            window.location.href='/bill/view/dics-item?billKey='+me._env.billkey+'&ID='+bill.ID;
        }


    },
    $del:function(){
		var me=this;
		var reqParams={};
        clone(this._env,reqParams);
        var dics=me._model[reqParams.billkey].sos;
        if(dics.length==0){
            alert("请选择需要删除记录");
            return;
        }else{
            for(var i=0;i<dics.length;i++){
                if(dics[i].status>=30){
                    alert("单据审核中，不可删除！");
                    return;
                }
            }
        }
        if(window.confirm('确认删除？')){
            reqParams.dics=angular.toJson(dics);
            this.$http.post("/bill/data/dics-item-delete",$.param(reqParams),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    }
                }).success(function (data) {
                    if(data.status=='1'){
                    	me.__loadDics();
                    	alert("删除成功！");
                    }else{
                        alert("单据保存失败,原因"+data.error);
                    }

            }).error(function (err) {
                alert("单据删除失败,原因:" + err);
            });
        }else{
            return ;
        }
        
        
        
        /*reqParams.model=angular.toJson(this._model);
		this.$http.post("/bill/data/dic-item-delete",$.param(reqParams),
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				}
			}).success(function(data){
				if(data.status == 1){
					me.__load();
					me.__clear();
					me._env.ID = '';
					me.parentId="";
					alert("删除成功！");
				}else{
					alert("删除失败！");
				}
		}).error(function(err){
				alert(err);
		});*/
	},
    $reBack:function(){
    	window.location.href='/bill/view/dics?billKey='+this._env.billkey;
    },
	save:function(){
		var me=this;
		var reqParams={};
        clone(this._env,reqParams);
        reqParams.model=angular.toJson(this._model);
		this.$http.post("/bill/data/dic-item-save",$.param(reqParams),
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				}
			}).success(function(data){
				if (data.status==1) {
					var billType = me._env.billtype;
					if(billType=="Dictionary"){
						me.__clear();
						me.__load();
						me._env.ID = '';
			        }else if(billType=="DicsItem"){
//			        	me.__loadDics();
			        	window.location.href='/bill/view/dics?billKey='+me._env.billkey;
			        }
					alert("保存成功!");
				}else{
					alert("保存失败！原因:" + data.error);
				}
		}).error(function(err){
			alert("保存失败,原因:" + err);
		});
	},
	
	edit:function (){
		var me=this;
		var data = {
				isParent:me.isParent,
				hasChild:me.hasChild
		}
		return data;
	},
	
	del:function(){
		var me=this;
		var reqParams={};
        clone(this._env,reqParams);
        reqParams.model=angular.toJson(this._model);
		this.$http.post("/bill/data/dic-item-delete",$.param(reqParams),
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				}
			}).success(function(data){
				if(data.status == 1){
					me.__load();
					me.__clear();
					me._env.ID = '';
					me.parentId="";
					alert("删除成功！");
				}else{
					alert("删除失败！");
				}
		}).error(function(err){
				alert(err);
		});
	},
	
	add:function(){
		var me=this;
		var parent = _$util.getParent(this);
		if (!parent.scope._model) {
            alert("父模型构建不完整.");
            return;
        }
		me._env.parentId = me._env.ID;
//		me._env.ID = '';
		this.__clear();
	},
	
	validAdd:function(){
		var me=this;
		if(me._env.ID==''||me._env.ID==null){
			return false;
		}else{
			return true;
		}
	},
	
	__clear: function () {
		for (var i = 0; i < this._model.tableKeys.length; i++) {
			if (this._model[this._model.tableKeys[i]].head) {
				this[this._model.tableKeys[i]] = clone(this._model[this._model.tableKeys[i]].archetype,{});
				this._model[this._model.tableKeys[i]].cos[0] =this[this._model.tableKeys[i]];
			}else {
				this._model[this._model.tableKeys[i]].cos =[];
			}
		};
		this.$broadcast('$_MODEL_CHANGE_$',this._model);
	},

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
         NProgress.start();
        this.__initCtrMethodCallback();
		this.__initViewStatus();
        this.__load();
    },
    
    dicsInit: function(){
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

        this.__loadDics();
    },

	__loadDics : function (entityKey) {
		var me = this;
		var url = '/bill/data/dics';
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
		this.$http.post(url, $.param(req),
			{
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
    
	__initViewStatus:function(){
		this.viewStatus=0;
	},

	getViewStatus:function(){
		if(this.viewStatus){
			return this.viewStatus;
		}
		return 0;
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

	__load:function(){
		var me=this;
		var billType = me._env.billtype;
		if(billType=="Dictionary"){
            url="/bill/data/dic";
        }else if(billType=="Dics"){
            url="/bill/data/dic-item";
        }else if(billType=="DicsItem"){
        	url="/bill/data/dics-item";
        }else{
            alert("页面类型异常");
            return;
        }
		this.$http.post(url,$.param(me._env),
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				}
			}).success(function(data){
				if(data.status==1){
					if(billType=="Dictionary"){
						me.__bindTree(data.data);
			        }else if(billType=="Dics" || billType=="DicsItem"){
			        	me.__bind(data.data);
			        }
					
				}else{
					alert(data.error);
				}

		}).error(function(err){
				alert(err);
		});
	},

	click:function(data){
		var me=this;
		var req={};
		if(data){
			var id=data[0].ID;
			this._env.ID = id;
			if(data[0].nodeType==1){
				me.isParent = true;
			}else{
				me.isParent = false;
			}
			if(data[0].isParent==true){
				me.hasChild = true;
			}else{
				me.hasChild = false;
			}
		}
		clone(this._env,req);
		this.$http.post("/bill/data/dic-item",$.param(req),
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				}
			}).success(function(data){
				me.__bind(data.data);
		}).error(function(err){
				alert(err);
		});

	},
	
	__bind:function(data){
		this._model.tableKeys = [];
		for(var i=0;i<data._models.length;i++){
			this._model.tableKeys.push(data._models[i]);
			var dataObject=data[data._models[i]];
			this._model[data._models[i]]=dataObject;
			dataObject.co=dataObject.cos[0];
			dataObject.sos=[];
			dataObject.dels=[];
            dataObject.archetype.shadowCol = [];
			if(dataObject.head){
				this[data._models[i]]=dataObject.co;
				this["$"+data._models[i]]=dataObject;
			}
			else{
                if(dataObject.cos && dataObject.cos.length>0){
                    for(var p =0; p<dataObject.cos.length; p++){
                        dataObject.cos[p].shadowCol=[];
                    }
                }
				this["__$"+data._models[i]+"$__"]=dataObject.cos;
				this["$"+data._models[i]]=dataObject; 
			}
		}
        NProgress.done();
		//发送修改广播
		this.$broadcast('$_MODEL_CHANGE_$',this._model);

	},
	
	__bindTree:function(data){
		for(var i=0;i<data._models.length;i++){
			var dataObject=data[data._models[i]];
			this._model["$t_"+data._models[i]]=dataObject.cos;
			//this["$t_"+data._models[i]]=dataObject.cos;
		}
        NProgress.done();
		//发送修改广播
		this.$broadcast('$_MODEL_CHANGE_$',this._model);

	}

};
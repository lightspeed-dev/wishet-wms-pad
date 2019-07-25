(function ($) {
    /*
     *继承方法：
     //定义基类构造函数
     function Person(name) {this.name = name; }
     //定义基本的方法
     $.extend(Person.prototype,{  })
     //子类构造函数
     function Author(name, books) {
     //必须调用父类的构造函数，否则，父类的特权级方法和属性将继承不到哟
     Author.superclass.constructor.call(this, name);
     this.books = books;
     }
     //扩展父
     Author.extend(Person, { });
     */
    Function.prototype.extend = function (parent, overrides) {
        if (typeof parent != 'function') return this;
        //保存对父类的引用
        this.base = parent.prototype;
        this.base.constructor = parent;
        //继承
        var f = function () {
        };
        f.prototype = parent.prototype;
        this.prototype = new f();
        this.prototype.constructor = this;
        //附加属性方法
        if (overrides) $.extend(this.prototype, overrides);
    };

    //延时加载
    Function.prototype.defer = function (o, defer, args) {
        var fn = this;
        return setTimeout(function () {
            fn.apply(o, args || []);
        }, defer);
    };

    /**
     核心为一个邮局协议，其他模块通过这个邮局进行订阅与发布消息
     */
    $.postOffice = ( function() {
        /**订阅消息
         * @param {Object} channel:订阅的频道
         * @param {Object} fn：回调函数
         */
        var subscribe = function(channel, fn, owner) {
                if (!$.postOffice.channels[channel]) {
                    $.postOffice.channels[channel] = [];
                }
                if (owner) {
                    $.postOffice.channels[channel].push({
                        context : owner, //这里的owner是订阅消息的对象，函数fn是其中的一个函数
                        callback : fn
                    });
                    return this;
                    //注意，默认情况这里的this为邮局对象本身
                } else {
                    $.postOffice.channels[channel].push({
                        context : this,
                        callback : fn
                    });
                    return this;
                }

            },
            /**
             * 向某个频道发送消息，消息一旦发布，会立马查看订阅了该频道消息的的对象，并执行其回调函数
             * @param {Object} channel 频道
             */
            publish = function(channel) {
                if (!$.postOffice.channels[channel]) {
                    return false;
                }

                //注意，发布消息时，除了第一个参数外，其他的参数作为回调函数的输入参数被输入
                var args = Array.prototype.slice.call(arguments, 1);

                //获取除chanel外的参数
                //扫描这个频道的订阅者
                for (var i = 0, l = $.postOffice.channels[channel].length; i < l; i++) {
                    var subscription = $.postOffice.channels[channel][i];
                    subscription.callback.apply(subscription.context, args);
                }
                return this;
            };

        /*
         *返回对应的对象，
         */
        return {
            channels : {
            },
            publish : publish,
            subscribe : subscribe,
            /**
             *  将消息安装到obj对象上，这样obj对象即为当前的工作上下文，等效于subscribe中的owner代理
             * @param {Object} obj
             */
            installTo : function(obj) {
                obj.subscribe = subscribe;
                obj.publish = publish;
            }
        };

    }());


    // 核心对象workflow
    window.workflow = $.workflow = {
        //定义对象属性
        version: "1.0.0",
        bkContainer: new HashTable(),//背景容器
        container: new HashTable(),//容器
        lineContainer: new HashTable(),//连接线容器
        noteContainer: new HashTable(),//注解容器
        operatorHandler: [],//操作模式处理器对象
        deletedObjects:new HashTable(),
        stepX:20,
        stepY:20,
        /**
         * 设置操作模式
         * @param mode
         */
        setOperatorMode: function (mode) {
            var oldMode = this.mode;
            this.mode = mode;
            if (this.operatorHandler[oldMode]) {
                this.operatorHandler[oldMode].unBindHandler();
            }
            if (this.operatorHandler[this.mode]) {
                this.operatorHandler[this.mode].bindHander();
            }
        },

        /**
         * 获取操作模式
         * @returns {*}
         */
        getOperatorMode: function () {
            if (this.mode) {
                return this.mode;
            }
            return 1;
        },

        /**
         * 删除组件
         * @param component
         */
        remove: function (component) {
            var key = this.container.getKey(component);
            if (key) {
                this.container.remove(key);
                this.deletedObjects.add(key,component);//放入删除队列
                var lcs=workflow.lineContainer.values();
                for(var i=0;i<lcs.length;i++){
                    if(lcs[i].target.CID==component.CID || lcs[i].source.CID==component.CID){
                        this.lineContainer.remove(lcs[i].CID);//从线图层删除线
                        this.deletedObjects.add(lcs[i].CID,lcs[i]);//放入删除队列
                    }
                }
                return;
            }
            key=this.lineContainer.getKey(component);
            if(key){
                this.lineContainer.remove(key);//从线图层删除线
                this.deletedObjects.add(key,component);//放入删除队列
                return;
            }


        },

        removeAll: function () {
            if (this.container) {
                this.bkContainer.removeAll();
                this.lineContainer.removeAll();
                this.container.removeAll();
                this.noteContainer.removeAll();
                this.render();
            }
        },

        removeSelectedObject:function(){
          if(this.selected){
              this.remove(this.selected);//删除选择的对象
              this.selected=null;
              this.render();
          }
        },
        /**
         * 挂接工作流对象
         * @param element：容器DOM元素
         * @param name:工作流名称
         * @param width：画布宽度
         * @param height：画布高度
         */
        mount: function (element, name, width, height) {
            this.name = name;
            this.width = width;
            this.height = height;
            //<canvas id="cvs" width="1000" height="800"></canvas>
            this.canvasEle = $("<canvas></canvas>");
            this.canvasEle.attr("width", width);
            this.canvasEle.attr("height", height);
            //this.canvasEle.css("position", "absolute");
            this.canvasEle.attr("id", name);
            //border:1px solid #ddd;
            this.element = element;
            $(this.element).append(this.canvasEle);
            this.canvasEle = this.canvasEle[0];
            this.canvas = this.canvasEle.getContext('2d');

        },


        /*
         *添加组件
         */
        add: function (component) {
        	//CID:组件id
            if (component.__getType()=="workflow.line" ) {
                this.lineContainer.add(component.__getCID(), component);
            } else {
                this.container.add(component.__getCID(), component);
            }
        },
        /*
         *添加组件到背景图层
         */
        addBk: function (component) {
            this.bkContainer.add(component.__getCID(), component);
        },

        /*
         *添加组件到背景图层
         */
        addLine: function (component) {
            this.lineContainer.add(component.__getCID(), component);
        },
        /*
         *添加组件到背景图层
         */
        addNote: function (component) {
            this.noteContainer.add(component.__getCID(), component);
        },


        /**
         * 渲染方法
         */
        render: function () {
            this.clearCanvas();
            this.renderBk();
            this.renderLine();
            this.renderContent();
            this.renderNote();
            this.renderSelectedNode();
        },


        /*
         * 渲染内容
         */
        renderContent: function () {
            var values = this.container.values();
            for (var i = 0; i < values.length; i++) {
                values[i]._render();//渲染之
            }
        },
        /**
         *  清空画布
         */
        clearCanvas: function () {
            this.canvas.clearRect(0, 0, this.width, this.height);
        },

        /**
         * 渲染线连接图层
         */
        renderLine: function () {
            var values = this.lineContainer.values();
            for (var i = 0; i < values.length; i++) {
                values[i]._render();//渲染之
            }
        },


        /**
         * 渲染背景图层
         */
        renderBk: function () {
            var values = this.bkContainer.values();
            for (var i = 0; i < values.length; i++) {
                values[i]._render();//渲染之
            }
            //绘制网格
            this.drawGrid();
        },
        drawGrid:function(){
            this.canvas.save();
            this.canvas.strokeStyle = "lightgray";
            //设置线宽为0.5
            this.canvas.lineWidth = 0.5;
            //绘制x轴网格
            //注意：canvas在两个像素的边界处画线
            //由于定位机制，1px的线会变成2px
            //于是要+0.5
            for (var i = this.stepX + 0.5; i < this.width; i = i + this.stepX) {
                //开启路径
                this.canvas.beginPath();
                this.canvas.moveTo(i, 0);
                this.canvas.lineTo(i, this.height);
                this.canvas.stroke();
            }

            //绘制y轴网格
            for (var i = this.stepY + 0.5; i < this.height; i = i + this.stepY) {
                this.canvas.beginPath();
                this.canvas.moveTo(0, i);
                this.canvas.lineTo(this.width, i);
                this.canvas.stroke();
            }
            this.canvas.restore();
        },

        /**
         * 渲染注解图层
         */
        renderNote: function () {
            var values = this.noteContainer.values();
            for (var i = 0; i < values.length; i++) {
                values[i]._render();//渲染之
            }
        },


        renderSelectedNode:function(){
           if(this.selected){
               var points=this.selected.getLinkedLinePointTo();
               for(var i=0;i<points.length;i++){
                   this.canvas.save();
                   this.canvas.beginPath();
                   this.canvas.fillStyle = "yellow";
                   this.canvas.strokeStyle = "#355878";
                   this.canvas.lineWidth = 1;
                   this.canvas.shadowOffsetX = -2;
                   this.canvas.shadowOffsetY = -2;
                   this.canvas.shadowColor = "gray";
                   this.canvas.shadowBlur = 15;
                   this.canvas.arc(points[i].x, points[i].y, 3, 0, 2 * Math.PI);
                   this.canvas.fill();
                   this.canvas.stroke();
                   this.canvas.restore();
               }
           }
        },
        getByCID:function(_cid){

        },

        getTarget: function (point) {
            var values = this.container.values();
            for (var i = 0; i < values.length; i++) {
                if (values[i]._containPoint(point)) {
                    return values[i];
                }
            }
            var values = this.lineContainer.values();
            for (var i = 0; i < values.length; i++) {
                if (values[i]._containPoint(point)) {
                    return values[i];
                }
            }
            return null;
        },
        //命名空间
        //核心控件,封装了一些常用方法
        core: {},
        //命名空间
        //核心图形命名空间
        shape: {},

        /*
         获取Canvas在屏幕上,相对坐标位置
         */
        getPointOnCanvas: function (x, y) {
            var _box = this.canvasEle.getBoundingClientRect();
            return {
                x: x - _box.left * (this.width / _box.width),
                y: y - _box.top * (this.height / _box.height)
            };
        },
        /*
         * addEventListener:监听Dom元素的事件
         *
         *  target：监听对象
         *  type：监听函数类型，如click,mouseover
         *  func：监听函数
         */
        addEventHandler: function (target, type, func) {
            if (target.addEventListener) {
                //监听IE9，谷歌和火狐
                target.addEventListener(type, func, false);
            } else if (target.attachEvent) {
                target.attachEvent("on" + type, func);
            } else {
                target["on" + type] = func;
            }
        },
        /*
         * removeEventHandler:移除Dom元素的事件
         *
         *  target：监听对象
         *  type：监听函数类型，如click,mouseover
         *  func：监听函数
         */
        removeEventHandler: function (target, type, func) {
            if (target.removeEventListener) {
                //监听IE9，谷歌和火狐
                target.removeEventListener(type, func, false);
            } else if (target.detachEvent) {
                target.detachEvent("on" + type, func);
            } else {
                delete target["on" + type];
            }
        },

        /**
         * 查看source与target之间是否有连接线
         * @param source
         * @param target
         */
        hasLinkedLine:function(source,target){
            var values = this.lineContainer.values();
            for (var i = 0; i < values.length; i++) {
                if(values[i].source.CID==source.CID &&  values[i].target.CID==target.CID){
                    return true;
                }
            }
            return false;
        }


    };

    /**
     * 模式处理器基础框架
     * @param mode
     * @constructor
     */
    workflow.core.ModeHandler = function (mode) {
        this.mode = mode;
    }
    $.extend(workflow.core.ModeHandler.prototype, {
        //获取模式类型
        _getModeType: function () {
            return this.mode;
        },
        //绑定handler
        bindHander: function () {


        },
        //解绑handler
        unBindHandler: function () {

        }

    });


    /**
     * 拖动模式处理器
     * @param mode
     * @constructor
     */
    workflow.core.DragModeHandler = function (mode) {
        workflow.core.DragModeHandler.base.constructor.call(this, mode);

    };
    workflow.core.DragModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {

        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },


        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }
            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            var curPoint = workflow.getPointOnCanvas(event.clientX, event.clientY);
            me.selected = workflow.getTarget(curPoint);
            workflow.selected=me.selected;//选择的对象
            if (me.selected) {
                if(me.selected.__getType()=="workflow.line"){
                    $.postOffice.publish("workflow.line.selected");
                }
                // else{
                //     $.postOffice.publish("workflow.activity.selected");
                // }
                // 选中表单
                me.draggable = !me.draggable;
                if (me.draggable) {
                    workflow.canvasEle.style.cursor = "move";
                } else {
                    workflow.canvasEle.style.cursor = "default";
                }
            }else{
                $.postOffice.publish("workflow.process.selected");
            }
            workflow.render();
        },
        mouseMove: function (event) {
            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            if (me.draggable) {
                var curPoint = workflow.getPointOnCanvas(event.clientX, event.clientY);
                if (me.selected) {
                    me.selected.moveTo(curPoint);
                    workflow.render();
                }
            }
        },
        mouseUp: function (event) {
            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            me.draggable = false;
            me.selected = null;
            workflow.canvasEle.style.cursor = "default";
        }
    });


    /**
     * 任务绘制模式处理器
     * @param mode
     * @constructor
     */
    workflow.core.TaskModeHandler = function (mode) {
        workflow.core.TaskModeHandler.base.constructor.call(this, mode);
        this.count = 1;
        this.defaultName = "任务";
    };
    workflow.core.TaskModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {
            return this.mode;
        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        /**
         * 鼠标按下事件
         * @param event
         */
        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }
            var p = workflow.getPointOnCanvas(event.clientX, event.clientY);
            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            new workflow.shape.Task(workflow.canvas, me.defaultName + me.count, p.x, p.y);
            me.count++;
            workflow.render();
            workflow.setOperatorMode(1);
        },
        mouseMove: function (event) {

        },
        mouseUp: function (event) {

        }


    });


    /**
     * 状态绘制模式处理器
     * @param mode
     * @constructor
     */
    workflow.core.StatusModeHandler = function (mode) {
        workflow.core.StatusModeHandler.base.constructor.call(this, mode);
        this.defaultName = "状态";
        this.count = 1;

    };
    workflow.core.StatusModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {

        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },

        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }
            var p = workflow.getPointOnCanvas(event.clientX, event.clientY);
            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            new workflow.shape.Status(workflow.canvas, me.defaultName + me.count, p.x, p.y);
            me.count++;
            workflow.render();
            workflow.setOperatorMode(1);
        },
        mouseMove: function (event) {

        },
        mouseUp: function (event) {

        }
    });


    /**
     * 会签绘制模式处理器
     * @param mode
     * @constructor
     */
    workflow.core.MeetingModeHandler = function (mode) {
        workflow.core.MeetingModeHandler.base.constructor.call(this, mode);
        this.defaultName = "会签";
        this.count = 1;

    };
    workflow.core.MeetingModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {

        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },

        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }


            var p = workflow.getPointOnCanvas(event.clientX, event.clientY);
            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            new workflow.shape.Meeting(workflow.canvas, me.defaultName + me.count, p.x, p.y);
            me.count++;
            workflow.render();
            workflow.setOperatorMode(1);
        },
        mouseMove: function (event) {

        },
        mouseUp: function (event) {

        }
    });


    /**
     * 决策绘制模式处理器
     * @param mode
     * @constructor
     */
    workflow.core.DecisionModeHandler = function (mode) {
        workflow.core.DecisionModeHandler.base.constructor.call(this, mode);
        this.defaultName = "决策";
        this.count = 1;

    };
    workflow.core.DecisionModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {

        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },

        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }

            var p = workflow.getPointOnCanvas(event.clientX, event.clientY);
            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            new workflow.shape.Decision(workflow.canvas, me.defaultName + me.count, p.x, p.y);
            me.count++;
            workflow.render();

            workflow.setOperatorMode(1);
        },
        mouseMove: function (event) {

        },
        mouseUp: function (event) {

        }
    });


    /**
     * fork绘制模式处理器
     * @param mode
     * @constructor
     */
    workflow.core.ForkModeHandler = function (mode) {
        workflow.core.ForkModeHandler.base.constructor.call(this, mode);
        this.defaultName = "分支";
        this.count = 1;

    };
    workflow.core.ForkModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {

        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },

        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }
            var p = workflow.getPointOnCanvas(event.clientX, event.clientY);
            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            new workflow.shape.Fork(workflow.canvas, me.defaultName + me.count, p.x, p.y);
            me.count++;
            workflow.render();
            workflow.setOperatorMode(1);
        },
        mouseMove: function (event) {

        },
        mouseUp: function (event) {

        }
    });


    /**
     * join绘制模式处理器
     * @param mode
     * @constructor
     */
    workflow.core.JoinModeHandler = function (mode) {
        workflow.core.JoinModeHandler.base.constructor.call(this, mode);
        this.defaultName = "合并";
        this.count = 1;

    };
    workflow.core.JoinModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {

        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },

        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }


            var p = workflow.getPointOnCanvas(event.clientX, event.clientY);
            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            new workflow.shape.Join(workflow.canvas, me.defaultName + me.count, p.x, p.y);
            me.count++;
            workflow.render();
            workflow.setOperatorMode(1);
        },
        mouseMove: function (event) {

        },
        mouseUp: function (event) {

        }
    });


    /**
     * subProcessMode绘制模式处理器
     * @param mode
     * @constructor
     */
    workflow.core.SubProcessModeHandler = function (mode) {
        workflow.core.SubProcessModeHandler.base.constructor.call(this, mode);
        this.defaultName = "子流程";
        this.count = 1;

    };
    workflow.core.SubProcessModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {

        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },

        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }


            var p = workflow.getPointOnCanvas(event.clientX, event.clientY);
            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            new workflow.shape.SubProcess(workflow.canvas, me.defaultName + me.count, p.x, p.y);
            me.count++;
            workflow.render();
            workflow.setOperatorMode(1);
        },
        mouseMove: function (event) {

        },
        mouseUp: function (event) {

        }
    });
    
    
    /**
     * dockProcessMode绘制模式处理器
     * @param mode
     * @constructor
     */
    workflow.core.DockProcessModeHandler = function (mode) {
        workflow.core.DockProcessModeHandler.base.constructor.call(this, mode);
        this.defaultName = "挂靠子流程";
        this.count = 1;

    };
    workflow.core.DockProcessModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {

        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },

        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }


            var p = workflow.getPointOnCanvas(event.clientX, event.clientY);
            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            new workflow.shape.DockProcess(workflow.canvas, me.defaultName + me.count, p.x, p.y);
            me.count++;
            workflow.render();
            workflow.setOperatorMode(1);
        },
        mouseMove: function (event) {

        },
        mouseUp: function (event) {

        }
    });
    
    
    /**
     * AssociationProcessMode绘制模式处理器
     * @param mode
     * @constructor
     */
    workflow.core.AssociationProcessModeHandler = function (mode) {
        workflow.core.AssociationProcessModeHandler.base.constructor.call(this, mode);
        this.defaultName = "关联子流程";
        this.count = 1;

    };
    workflow.core.AssociationProcessModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {

        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },

        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }


            var p = workflow.getPointOnCanvas(event.clientX, event.clientY);
            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            new workflow.shape.AssociationProcess(workflow.canvas, me.defaultName + me.count, p.x, p.y);
            me.count++;
            workflow.render();
            workflow.setOperatorMode(1);
        },
        mouseMove: function (event) {

        },
        mouseUp: function (event) {

        }
    });
    
    

    /**
     * 开始绘制模式处理器
     * @param mode
     * @constructor
     */
    workflow.core.StartModeHandler = function (mode) {
        workflow.core.StartModeHandler.base.constructor.call(this, mode);
        this.defaultName = "start";
    };
    workflow.core.StartModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {

        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },

        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }
            var p = workflow.getPointOnCanvas(event.clientX, event.clientY);
            new workflow.shape.Start(workflow.canvas, "start", p.x, p.y);
            workflow.render();
            workflow.setOperatorMode(1);
        },
        mouseMove: function (event) {

        },
        mouseUp: function (event) {

        }
    });


    /**
     * 结束结点绘制模式
     * @param mode
     * @constructor
     */
    workflow.core.EndModeHandler = function (mode) {
        workflow.core.EndModeHandler.base.constructor.call(this, mode);
        this.defaultName = "end";
    };
    workflow.core.EndModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {

        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },

        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }

            var p = workflow.getPointOnCanvas(event.clientX, event.clientY);
            new workflow.shape.End(workflow.canvas, "end", p.x, p.y);
            workflow.render();

            workflow.setOperatorMode(1);
        },
        mouseMove: function (event) {

        },
        mouseUp: function (event) {

        }
    });

    /**
     * 连接线模式
     * @param mode
     * @constructor
     */
    workflow.core.LinkedLineModeHandler = function (mode) {
        workflow.core.LinkedLineModeHandler.base.constructor.call(this, mode);
        this.drawableLine = false;
        this.defaultName = "转移";
        this.count = 1;

    };
    workflow.core.LinkedLineModeHandler.extend(workflow.core.ModeHandler, {
        //获取模式类型
        _getModeType: function () {

        },
        //绑定handler
        bindHander: function () {
            workflow.addEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.addEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.addEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },
        //解绑handler
        unBindHandler: function () {
            workflow.removeEventHandler(workflow.canvasEle, "mousedown", this.mouseDown);
            workflow.removeEventHandler(workflow.canvasEle, "mousemove", this.mouseMove);
            workflow.removeEventHandler(workflow.canvasEle, "mouseup", this.mouseUp);
        },

        mouseDown: function (event) {
            if(event.button!=0){
                return;
            }

            var me = workflow.operatorHandler[workflow.getOperatorMode()];
            if (!me.drawableLine) {
                var curPoint = workflow.getPointOnCanvas(event.clientX, event.clientY);
                //判断当前按下鼠标地方是那个对象
                me.source = workflow.getTarget(curPoint);
                //绘制链接线
                if (me.source && me.source.__getType()!="workflow.line") {
                    me.drawableLine = true;
                }
            } else {
                var curPoint = workflow.getPointOnCanvas(event.clientX, event.clientY);
                me.target = workflow.getTarget(curPoint);
                if (me.target  && me.target.__getType()!="workflow.line"&& me.source && me.target.CID != me.source.CID) {//绘制线
                    //查看源和目标之间是否有连接线，如果没有创建之，有则不构建
                    if(!workflow.hasLinkedLine(me.source,me.target)){
                        new workflow.shape.Line(workflow.canvas, me.defaultName + me.count, me.source, me.target);
                        me.count++;
                    }
                    me.target = null;
                    me.source = null;
                    me.drawableLine = false;
                    workflow.render();
                }
            }
        },
        mouseMove: function (event) {


        },
        mouseUp: function (event) {


        }
    });




    /** 操作模式绑定
     *      1==》dragMode
     *      2==》taskMode
     *      3==》statusMode
     *      4==》meetingMode
     *      5==》decisionMode
     *      6==》forkMode,
     *      7==》joinMode
     *      8==》subProcessMode
     *      9==》startMode
     *      10==》endMode
     *      11==》linkedLineMode
     *      12==》DockProcessMode
     *      13==》AssociationProcessMode
     */
    workflow.operatorHandler[1] = new workflow.core.DragModeHandler(1);
    workflow.operatorHandler[2] = new workflow.core.TaskModeHandler(2);
    workflow.operatorHandler[3] = new workflow.core.StatusModeHandler(3);
    workflow.operatorHandler[4] = new workflow.core.MeetingModeHandler(4);
    workflow.operatorHandler[5] = new workflow.core.DecisionModeHandler(5);
    workflow.operatorHandler[6] = new workflow.core.ForkModeHandler(6);
    workflow.operatorHandler[7] = new workflow.core.JoinModeHandler(7);
    workflow.operatorHandler[8] = new workflow.core.SubProcessModeHandler(8);
    workflow.operatorHandler[9] = new workflow.core.StartModeHandler(9);
    workflow.operatorHandler[10] = new workflow.core.EndModeHandler(10);
    workflow.operatorHandler[11] = new workflow.core.LinkedLineModeHandler(11);
    workflow.operatorHandler[12] = new workflow.core.DockProcessModeHandler(12);
    workflow.operatorHandler[13] = new workflow.core.AssociationProcessModeHandler(13);



    //组件基类,该基类
    //1,完成定义参数处理方法和参数属性初始化的工作
    //2,完成定义事件处理方法和事件属性初始化的工作
    workflow.core.Component = function (options) {
        //组件配置参数
        this.options = options || {};
        if (this.__getType() == "workflow.node.start") {
        	var conTable = workflow.container.values();
            for(var i=0;i<conTable.length;i++){
            	if(conTable[i].__getType()=='workflow.node.start')
            	{
            		console.log("开始节点已经存在");
                    return;
            	}else
            	{
            		workflow.startNode = this;
            	}
            	 
            };
        	/*
            if (workflow.startNode)  {
                console.log("开始节点已经存在");
                return;
            } else {
                
            }*/
        }
        if (this.__getType() == "workflow.node.end") {
        	var conTable = workflow.container.values();
            for(var i=0;i<conTable.length;i++){
            	
            	if(conTable[i].__getType()=='workflow.node.end')
            	{
            		console.log("结束节点已经存在");
                    return;
            	}else
            	{
            		workflow.endNode = this;
            	}
            	 
            };
//            if (workflow.endNode) {
//                console.log("结束节点已经存在");
//                return;
//            } else {
//                workflow.endNode = this;
//            }
        }
        if(options && options.newCID){
        	 this.CID=options.CID;
        }else{
        	 this.CID = newGuid();
        }

        if(options && options.newOID){
            this.OID=options.OID;
        }else
        {
            this.OID="";
        }
        //this.OID = setOID();

        workflow.add(this);
        this._customEventListeners = {};
    };


    //定义组件的方法
    $.extend(workflow.core.Component.prototype, {
        __getCID: function () {
            return this.CID;
        },
        __getType: function () {
            return 'workflow.core.Component';
        },
        __getOID:function(){
            return this.OID;
        },
        /*
         *   自定义事件：添加事件
         */
        addEvent: function (type, func) {
            if (!this._customEventListeners) //如果事件类型列表为空，建立事件类型列表，数据方式 为：类型名：函数名
                this._customEventListeners = {};
            var funcs = this._customEventListeners;
            //将事件类型与处理函数相关联，注意，这里每种类型可存入多个事件，是一个二维数组
            funcs[type] ? funcs[type].push(func) : funcs[type] = [func];
        },


        /*
         * 自定义事件删除指定类型事件
         */
        delEvent: function (type, func) {
            var funcs = this._customEventListeners[type];
            if (funcs) {
                for (var i = funcs.length - 1; i >= 0; i--) {
                    if (funcs[i] == func) {
                        funcs[i] = null;
                        break;
                    }
                }
            }
        },


        /*
         * 自定义事件：引爆指定类型的事件，第一个参数为事件类型，后面的参数为事件参数
         */
        fireEvent: function (type) {
            if (!this._customEventListeners[type]) //不支持的话，直接返回
                return;
            var funcs = this._customEventListeners[type], s = this, ars = $A(arguments);
            ars.shift();
            for (var i = funcs.length - 1; i >= 0; i--) {
                if (funcs[i])
                    funcs[i].apply(s, ars);
            }
        },

        /*
         * 组件的销毁方法
         */
        destroy: function () {
            workflow.remove(this);
        }
    });


    /**
     * 流程组件的图形化基础类组件
     * @param type
     * @param options
     * @constructor
     */
    workflow.core.Shape = function (canvas, text, options) {
        workflow.core.Shape.base.constructor.call(this, options);//调用基类构造函数
        this.canvas = canvas;//画布
        this.text = text;//文本
        this.options={
        };
        this._init();//初始化方法
    };

    workflow.core.Shape.extend(workflow.core.Component, {
        //初始化事件
        _initEvents: function () {

        },
        __getType: function () {
            //子类实现之
        },
        //初始化方法，子类实现之
        _init: function () {

        },
        //渲染方法
        _render: function () {

        },

        moveTo: function (point) {

        },
        /**
         * 判断当鼠标点击点是否在当前图形上
         * @param point
         * @private
         */
        _containPoint: function (point) {

        },
        /**
         * 获取连接线点起点，为图形中形点
         */
        getLinkedLinePointFrom:function(){

        },
        /**
         * 获取连接点入口点，一个图形在正交方向默认有四个正交点
         */
        getLinkedLinePointTo:function(){

        },
        /**
         *
         */
        toJSON:function(){

        },
        /**
         * fromJSON
         */
        fromJSON:function(json){

        },



    });
    /**
     * save
     */
   
    //连接线工具
    /**
     * 任务节点构造函数
     * @param canvas
     * @param text
     * @param x
     * @param y
     * @param width
     * @param hieght
     * @param options
     * @constructor
     */
    workflow.shape.Line = function (canvas,text,source,target,options,drawType) {
        workflow.shape.Line.base.constructor.call(this,canvas,text,options);//调用基类构造函数
        this._init();//初始化方法
        this.source=source;
        this.target=target;
        this.drawType = drawType;
       // this.po={};
    };

    workflow.shape.Line.extend(workflow.core.Shape, {
        __getType: function () {
            return "workflow.line";
        },
        //初始化方法，子类实现之
        _init: function () {
            this.addEvent("onselected",function(o){
//                alert(o);
            });
        },

        //渲染方法
        _render: function () {
            this.__renderBox();
            this.__renderText();

        },

        getLinkedLinePointTo:function(){
            return [this.cp];
        },

        getLinkedLinePointFrom:function(){
            return this.cp;
        },

        /**
         * 线的移动，以中间的控制点为中心进行移动
         * @param point
         */
        moveTo:function(point){
            var offsetX=Math.abs(point.x-this.cp.x);
            var offserY=Math.abs(point.y-this.cp.y);
            if(offsetX<=30 && offserY<=30){
                this.cp=point;
            }

        },

        //判断屏幕输入点是否在当前点范围内
        _containPoint: function (point) {
            if(this.sp && this.cp && this.tp){
                var d_sp_cp=getPointDistance(this.sp,this.cp);
                var d_tp_cp=getPointDistance(this.cp,this.tp);
                var p_sp_cp=getPointDistance(point,this.sp)+getPointDistance(point,this.cp);
                var p_tp_cp=getPointDistance(point,this.tp)+getPointDistance(point,this.cp);
                if(p_sp_cp-d_sp_cp<=0.5){
                    return true;
                }
                if(p_tp_cp-d_tp_cp<=0.5){
                    return true;
                }
            }
            return false;
        },


        /**
         * 画线
         * @private
         */
        __renderBox: function () {

            this.canvas.save();
            this.canvas.strokeStyle = "gray";
            this.canvas.fillStyle = "gray";
            this.canvas.lineWidth = 1;
            this.sp = this.source.getLinkedLinePointFrom();//源端点
            this.tp = getNearestPoint(this.sp, this.target.getLinkedLinePointTo());//目标点，动态点，从控制点中动态获取
            if (!this.cp)
                this.cp = {x: (this.sp.x + this.tp.x) / 2, y: (this.sp.y + this.tp.y) / 2};//控制点，可以控制二次贝塞尔曲线
            //绘制2次贝塞尔曲线
            this.canvas.beginPath();
            this.canvas.moveTo(this.sp.x, this.sp.y);
            if (this.drawType == 1) {
                this.canvas.lineTo(this.cp.x, this.cp.y);  //折线添加一个控制点。
                this.tp = getNearestPoint(this.cp, this.target.getLinkedLinePointTo());
            }
            this.canvas.quadraticCurveTo(this.cp.x, this.cp.y, this.tp.x, this.tp.y);
            //this.canvas.strokeStyle = "red";
            this.canvas.stroke();
            // draw the ending arrowhead
            var endRadians = Math.atan((this.tp.y - this.cp.y) / (this.tp.x - this.cp.x));
            endRadians += ((this.tp.x > this.cp.x) ? 90 : -90) * Math.PI / 180;
            this.__drawArrowhead(this.tp.x, this.tp.y, endRadians);
        },

        __drawArrowhead:function(x,y,radians){
            this.canvas.beginPath();
            this.canvas.translate(x,y);
            this.canvas.rotate(radians);
            this.canvas.moveTo(0,0);
            this.canvas.lineTo(6,18);
            this.canvas.lineTo(-6,18);
            this.canvas.closePath();
            this.canvas.fill();
            this.canvas.restore();
        },

        __renderText:function(){
            this.canvas.save();
            this.canvas.fillStyle="black";
            this.canvas.fillText(this.text,(this.tp.x+this.cp.x)/2,(this.tp.y+this.cp.y)/2);
            this.canvas.restore();
        },
        toJSON: function () {
            var lineResult = {};
            lineResult.cp = this.cp;//控制点
            lineResult.source = this.source.__getCID();//指向源端点的指针
            lineResult.target = this.target.__getCID();//指向目标端点指标
            lineResult.drawType = this.drawType;//绘画类型
            lineResult.cid = this.CID;
            lineResult.type = this.__getType();
            lineResult.text = this.text;
            lineResult.labelName=this.labelName;
            return lineResult;
        },
        fromJSON: function (json) {
            this.text = json.text;
            this.labelName = json.labelName;
            this.cp = json.cp;
            this.drawType = json.drawType;
            this.source = workflow.container.get(json.source);
            if (this.source == null) {
                alert("源活动为空，请检查");
            }
            this.target = workflow.container.get(json.target);
            if (this.target == null) {
                alert("目标活动为空，请检查");
            }
            return this;
        }
    });
//    决策
    /**
     * 任务节点构造函数
     * @param canvas
     * @param text
     * @param x
     * @param y
     * @param width
     * @param hieght
     * @param options
     * @constructor
     */
    workflow.shape.Decision = function (canvas,text,x,y,options) {
        workflow.shape.Decision.base.constructor.call(this, canvas,text,options);//调用基类构造函数
        //debugger;
        this._init();//初始化方法
        this.x=x;
        this.y=y;
        this.fillStyle="#355878";
        this.strokeStyle="#355878";
        this.po={};
    };
    workflow.shape.Decision.extend(workflow.core.Shape, {
        __getType: function () {
            return "workflow.node.decision";
        },
        //初始化方法，子类实现之
        _init: function () {

        },

        //判断屏幕输入点是否在当前点范围内
        _containPoint: function (point) {
            var min_x=this.x;
            var max_x=this.x+this.width;
            var min_y=this.y;
            var max_y=this.y+this.height;
            return point.x<=max_x && point.x>=min_x && point.y>=min_y && point.y<=max_y;
        },


        moveTo:function(point){
        	 //设为中间点移动到point点
        	this.x=point.x-this.width/2;
            this.y=point.y-this.height/2;
        },

        getLinkedLinePointFrom:function(){
            return {x:this.x+this.width/2,y:this.y+this.height/2}
        },


        getLinkedLinePointTo:function(){
            return [
                {x:this.x+this.width/2,y:this.y},
                {x:this.x+this.width,y:this.y+this.height/2},
                {x:this.x+this.width/2,y:this.y+this.height},
                {x:this.x,y:this.y+this.height/2}
            ];
        },
        //渲染方法
        _render: function () {
            this.__renderBox();
            this.__renderText();
        },
        __renderBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=4;

            var metrics=this.canvas.measureText(this.text);
            this.fontWidth=metrics.width;
            if(metrics.width<80){
                this.width=80;
            }else{
                this.width=metrics.width+40;
            }
            this.height=40;
            this.canvas.rhombus(this.x,this.y,this.width,this.height);
            this.canvas.fill();
            this.canvas.stroke();
            this.canvas.restore();
        },

        __renderText:function(){
            this.canvas.save();
            //this.canvas.font="bold 10px sans-serif";
            this.canvas.fillStyle="white";
            this.canvas.fillText(this.text,this.x+(this.width-this.fontWidth)/2,this.y+25);
            this.canvas.restore();
        },
        toJSON:function() {
            var result={};
            result.point={ x:this.x,y:this.y, w:this.width,h:this.height}
            result.style={fillStyle:this.fillStyle,strokeStyle:this.strokeStyle}
            result.text={text:this.text,cid:this.CID,oid:this.OID}
            result.trains=[];
            result.po=this.po;
            result.type=this.__getType();
            return result;
        },
        fromJSON:function(json,decision)
        {
            decision.text=json.text.text;
            decision.x=json.point.x;
            decision.y=json.point.y;
            decision.width=json.point.w;
            decision.height=json.point.h;
            decision.po=json.po;
            decision.OID=json.text.oid;
        }
    });
//    开始节点
    /**
     * 任务节点构造函数
     * @param canvas
     * @param text
     * @param x
     * @param y
     * @param width
     * @param hieght
     * @param options
     * @constructor
     */
    workflow.shape.Start = function (canvas, text, x, y, options) {
        workflow.shape.Start.base.constructor.call(this, canvas, text, options);//调用基类构造函数
        this._init();//初始化方法
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.fillStyle="#5eb95e";
        this.strokeStyle="#5eb95e";
        this.po={};
        //this.fill=adfldf;
        //$.extend(this,)options

    };

    workflow.shape.Start.extend(workflow.core.Shape, {
        __getType: function () {
            return "workflow.node.start";
        },
        //初始化方法，子类实现之
        _init: function () {

        },

        moveTo: function (point) {
            this.x = point.x;
            this.y = point.y;
        },

        //渲染方法
        _render: function () {
            this.__renderBox();
        },

        //判断屏幕输入点是否在当前点范围内
        _containPoint: function (point) {
            var distance = getPointDistance(point, {x: this.x, y: this.y});
            return this.radius >= distance;
        },
        getLinkedLinePointFrom:function(){
            return {x:this.x,y:this.y}
        },

        getLinkedLinePointTo:function(){
            return [
                {x:this.x,y:this.y-this.radius},
                {x:this.x+this.radius,y:this.y},
                {x:this.x,y:this.y+this.radius},
                {x:this.x-this.radius,y:this.y}
            ];
        },

        __renderBox: function () {
            this.canvas.save();
            this.canvas.beginPath();
            this.canvas.fillStyle = this.fillStyle;
            this.canvas.strokeStyle = this.strokeStyle;
            this.canvas.lineWidth = 1;
            this.canvas.shadowOffsetX = -2;
            this.canvas.shadowOffsetY = -2;
            this.canvas.shadowColor = "gray";
            this.canvas.shadowBlur = 8;

            this.canvas.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            this.canvas.fill();
            this.canvas.stroke();
            this.canvas.restore();
        },
        toJSON:function() {
            var result={};
            result.point={ x:this.x,y:this.y,radius:this.radius}
            result.style={fillStyle:this.fillStyle,strokeStyle:this.strokeStyle}
            result.text={text:this.text,cid:this.CID,oid:this.OID}
            result.trains=[];
            result.po=this.po;
            result.type=this.__getType();
            return result;
        },
        fromJSON:function(json,start)
        {
            start.text=json.text.text;
            start.x=json.point.x;
            start.y=json.point.y;
            start.radius=json.point.radius;
            start.po=json.po;
            start.OID=json.text.oid;
        }
    });
//结束节点
    /**
     * 任务节点构造函数
     * @param canvas
     * @param text
     * @param x
     * @param y
     * @param width
     * @param hieght
     * @param options
     * @constructor
     */
    workflow.shape.End = function (canvas,text,x,y,options) {
        workflow.shape.End.base.constructor.call(this, canvas,text,options);//调用基类构造函数
        this._init();//初始化方法
        this.x=x;
        this.y=y;
        this.width=40;
        this.height=25;
        this.offset=10;
        this.fillStyle="red";
        this.strokeStyle="#355878";
        this.po={};
    };

    workflow.shape.End.extend(workflow.core.Shape, {
        __getType: function () {
            return "workflow.node.end";
        },
        //初始化方法，子类实现之
        _init: function () {

        },

        //判断屏幕输入点是否在当前点范围内
        _containPoint: function (point) {
            var min_x=this.x;
            var max_x=this.x+this.width;
            var min_y=this.y;
            var max_y=this.y+this.height;
            return point.x<=max_x && point.x>=min_x && point.y>=min_y && point.y<=max_y;
        },

        getLinkedLinePointFrom:function(){
            return {x:this.x+this.width/2,y:this.y+this.height/2}
        },

        getLinkedLinePointTo:function(){
            return [
                {x:this.x+this.width/2,y:this.y},
                {x:this.x+this.width,y:this.y+this.height/2},
                {x:this.x+this.width/2,y:this.y+this.height},
                {x:this.x,y:this.y+this.height/2}
            ];
        },
        moveTo:function(point){
            this.x=point.x;
            this.y=point.y;
        },

        //渲染方法
        _render: function () {
            this.__renderBox();
        },

        __renderBox:function(){
            this.canvas.save();
            this.canvas.beginPath();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-1;
            this.canvas.shadowOffsetY=-1;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=4;
            this.canvas.roundRect(this.x,this.y,this.width,this.height,this.offset);
            this.canvas.fill();
            this.canvas.stroke();
            this.canvas.restore();
        },
        toJSON:function() {
            var result={};
            result.point={ x:this.x,y:this.y, w:this.width,h:this.height}
            result.style={fillStyle:this.fillStyle,strokeStyle:this.strokeStyle}
            result.text={text:this.text,cid:this.CID,oid:this.OID}
            result.trains=[];
            result.po=this.po;
            result.type=this.__getType();
            return result;
        },
        fromJSON:function(json,end)
        {
            end.text=json.text.text;
            end.x=json.point.x;
            end.y=json.point.y;
            end.width=json.point.w;
            end.height=json.point.h;
            end.po=json.po;
            end.OID=json.text.oid;
        }
    });
//分支
    /**
     * 任务节点构造函数
     * @param canvas
     * @param text
     * @param x
     * @param y
     * @param width
     * @param hieght
     * @param options
     * @constructor
     */
    workflow.shape.Fork = function (canvas,text,x,y,options) {
        workflow.shape.Fork.base.constructor.call(this, canvas,text,options);//调用基类构造函数
        this._init();//初始化方法
        this.x=x;
        this.y=y;
        this.radius=20;
        this.fillStyle="#7CC3B1";
        this.strokeStyle="#7CC3B1";
        this.po={};
    };

    workflow.shape.Fork.extend(workflow.core.Shape, {
        __getType: function () {
            return "workflow.node.fork";
        },
        //初始化方法，子类实现之
        _init: function () {

        },
        //渲染方法
        _render: function () {
            this.__renderBox();
            this.__renderText();
        },

        //判断屏幕输入点是否在当前点范围内
        _containPoint: function (point) {
            var distance = getPointDistance(point, {x: this.x, y: this.y});
            return this.radius >= distance;
        },

        getLinkedLinePointFrom:function(){
            return {x:this.x,y:this.y}
        },

        getLinkedLinePointTo:function(){
            return [
                {x:this.x,y:this.y-this.radius},
                {x:this.x+this.radius,y:this.y},
                {x:this.x,y:this.y+this.radius},
                {x:this.x-this.radius,y:this.y}
            ];
        },

        moveTo:function(point){
            this.x=point.x;
            this.y=point.y;
        },


        __renderBox:function(){
            this.canvas.save();
            this.canvas.beginPath();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            this.canvas.arc(this.x,this.y,this.radius,0,2*Math.PI);
            this.canvas.fill();
            this.canvas.stroke();
            this.canvas.restore();
        },
        __renderText:function(){
            this.canvas.save();
            //this.canvas.font="bold 10px sans-serif";
            this.canvas.fillStyle="white";
            this.canvas.fillText(this.text,this.x-15,this.y+5);
            this.canvas.restore();
        },
        toJSON:function() {
            var result={};
            result.point={ x:this.x,y:this.y,radius:this.radius}
            result.style={fillStyle:this.fillStyle,strokeStyle:this.strokeStyle}
            result.text={text:this.text,cid:this.CID,oid:this.OID}
            result.trains=[];
            result.po=this.po;
            result.type=this.__getType();
            return result;
        },
        fromJSON:function(json,fork)
        {
            fork.text=json.text.text;
            fork.x=json.point.x;
            fork.y=json.point.y;
            fork.radius=json.point.radius;
            fork.po=json.po;
            fork.OID=json.text.oid;
        }
    });
//合并
    /**
     * 任务节点构造函数
     * @param canvas
     * @param text
     * @param x
     * @param y
     * @param width
     * @param hieght
     * @param options
     * @constructor
     */
    workflow.shape.Join = function (canvas,text,x,y,options) {
        workflow.shape.Join.base.constructor.call(this, canvas,text,options);//调用基类构造函数
        this._init();//初始化方法
        this.x=x;
        this.y=y;
        this.radius=20;
        this.fillStyle="#355878";
        this.strokeStyle="#355878";
        this.po={};
    };

    workflow.shape.Join.extend(workflow.core.Shape, {
        __getType: function () {
            return "workflow.node.join";
        },
        //初始化方法，子类实现之
        _init: function () {

        },

        //判断屏幕输入点是否在当前点范围内
        _containPoint: function (point) {
            var distance = getPointDistance(point, {x: this.x, y: this.y});
            return this.radius >= distance;
        },

        moveTo:function(point){
            this.x=point.x;
            this.y=point.y;
        },
        getLinkedLinePointFrom:function(){
            return {x:this.x,y:this.y}
        },
        getLinkedLinePointTo:function(){
            return [
                {x:this.x,y:this.y-this.radius},
                {x:this.x+this.radius,y:this.y},
                {x:this.x,y:this.y+this.radius},
                {x:this.x-this.radius,y:this.y}
            ];
        },

        //渲染方法
        _render: function () {
            this.__renderBox();
            this.__renderText();
        },
        __renderBox:function(){
            this.canvas.save();
            this.canvas.beginPath();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            this.canvas.arc(this.x,this.y,this.radius,0,2*Math.PI);
            this.canvas.fill();
            this.canvas.stroke();
            this.canvas.restore();
        },
        __renderText:function(){
            this.canvas.save();
            //this.canvas.font="bold 10px sans-serif";
            this.canvas.fillStyle="white";
            this.canvas.fillText(this.text,this.x-15,this.y+5);
            this.canvas.restore();
        },
        toJSON:function() {
            var result={};
            result.point={ x:this.x,y:this.y,radius:this.radius}
            result.style={fillStyle:this.fillStyle,strokeStyle:this.strokeStyle}
            result.text={text:this.text,cid:this.CID,oid:this.OID}
            result.trains=[];
            result.po=this.po;
            result.type=this.__getType();
            return result;
        },
        fromJSON:function(json,join)
        {
            join.text=json.text.text;
            join.x=json.point.x;
            join.y=json.point.y;
            join.radius=json.point.radius;
            join.po=json.po;
            join.OID=json.text.oid;
        }

    });
//    会签
    /**
     * 任务节点构造函数
     * @param canvas
     * @param text
     * @param x
     * @param y
     * @param width
     * @param hieght
     * @param options
     * @constructor
     */
    workflow.shape.Meeting = function (canvas,text,x,y,options) {
        workflow.shape.Meeting.base.constructor.call(this, canvas,text,options);//调用基类构造函数
        this._init();//初始化方法
        this.x=x;
        this.y=y;
        this.fillStyle="#355878";
        this.strokeStyle="#355878";
        this.po={};
    };

    workflow.shape.Meeting.extend(workflow.core.Shape, {
        __getType: function () {
            return "workflow.node.meeting";
        },
        //初始化方法，子类实现之
        _init: function () {

        },
        //渲染方法
        _render: function () {
            this.__renderBox();
            this.__renderText();
        },

        //判断屏幕输入点是否在当前点范围内
        _containPoint: function (point) {
            var min_x=this.x;
            var max_x=this.x+this.width;
            var min_y=this.y;
            var max_y=this.y+this.height;
            return point.x<=max_x && point.x>=min_x && point.y>=min_y && point.y<=max_y;
        },


        moveTo:function(point){
            //设为中间点移动到point点
        	this.x=point.x-this.width/2;
            this.y=point.y-this.height/2;
        },

        getLinkedLinePointFrom:function(){
            return {x:this.x+this.width/2,y:this.y+this.height/2}
        },

        getLinkedLinePointTo:function(){
            return [
                {x:this.x+this.width/2,y:this.y},
                {x:this.x+this.width,y:this.y+this.height/2},
                {x:this.x+this.width/2,y:this.y+this.height},
                {x:this.x,y:this.y+this.height/2}
            ];
        },


        __renderBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            var metrics=this.canvas.measureText(this.text);
            this.fontWidth=metrics.width;
            if(metrics.width<80){
                this.width=80;
            }else{
                this.width=metrics.width+40;
            }
            this.height=40;
            this.canvas.quadrangle(this.x,this.y,this.width,this.height,15);
            this.canvas.fill();
            this.canvas.stroke();
            this.canvas.restore();

        },

        __renderText:function(){
            this.canvas.save();
            //this.canvas.font="bold 10px sans-serif";
            this.canvas.fillStyle="white";
            this.canvas.fillText(this.text,this.x+(this.width-this.fontWidth)/2,this.y+25);
            this.canvas.restore();
        },
        toJSON:function() {
            var result={};
            result.point={ x:this.x,y:this.y,w:this.width,h:this.height}
            result.style={fillStyle:this.fillStyle,strokeStyle:this.strokeStyle}
            result.text={text:this.text,cid:this.CID,oid:this.OID}
            result.trains=[];
            result.po=this.po;
            result.type=this.__getType();
            return result;
        },
        fromJSON:function(json,meeting)
        {
            meeting.text=json.text.text;
            meeting.x=json.point.x;
            meeting.y=json.point.y;
            meeting.width=json.point.w;
            meeting.height=json.point.h;
            meeting.po=json.po;
            meeting.OID=json.text.oid;
        }
    });
//状态节点
    /**
     * 状态节点构造函数
     * @param canvas
     * @param text
     * @param x
     * @param y
     * @param width
     * @param hieght
     * @param options
     * @constructor
     */
    workflow.shape.Status = function (canvas,text,x,y,options) {
        workflow.shape.Status.base.constructor.call(this, canvas,text,options);//调用基类构造函数
        this._init();//初始化方法
        this.x=x;
        this.y=y;
        this.fillStyle="#355878";
        this.strokeStyle="#355878";
        this.po={};
    };

    workflow.shape.Status.extend(workflow.core.Shape, {
        __getType: function () {
            return "workflow.node.status";
        },
        //初始化方法，子类实现之
        _init: function () {

        },
        //渲染方法
        _render: function () {
            this.__renderBox();
            this.__renderText();
        },

        //判断屏幕输入点是否在当前点范围内
        _containPoint: function (point) {
            var min_x=this.x;
            var max_x=this.x+this.width;
            var min_y=this.y;
            var max_y=this.y+this.height;
            return point.x<=max_x && point.x>=min_x && point.y>=min_y && point.y<=max_y;
        },

        moveTo:function(point){
            //设为中间点移动到point点
        	this.x=point.x-this.width/2;
            this.y=point.y-this.height/2;
        },
        getLinkedLinePointFrom:function(){
            return {x:this.x+this.width/2,y:this.y+this.height/2}
        },

        getLinkedLinePointTo:function(){
            return [
                {x:this.x+this.width/2,y:this.y},
                {x:this.x+this.width,y:this.y+this.height/2},
                {x:this.x+this.width/2,y:this.y+this.height},
                {x:this.x,y:this.y+this.height/2}
            ];
        },


        __renderBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            var metrics=this.canvas.measureText(this.text);
            this.fontWidth=metrics.width;
            if(metrics.width<80){
                this.width=80;
            }else{
                this.width=metrics.width+40;
            }
            this.height=40;
            this.canvas.roundRect(this.x,this.y,this.width,this.height,10);
            this.canvas.fill();
            this.canvas.stroke();

            this.canvas.restore();

        },
        __renderText:function(){
            this.canvas.save();
            //this.canvas.font="bold 10px sans-serif";
            this.canvas.fillStyle="white";
            this.canvas.fillText(this.text,this.x+(this.width-this.fontWidth)/2,this.y+25);
            this.canvas.restore();
        },
        toJSON:function() {
            var result={};
            result.point={ x:this.x,y:this.y,w:this.width,h:this.height}
            result.style={fillStyle:this.fillStyle,strokeStyle:this.strokeStyle}
            result.text={text:this.text,cid:this.CID,oid:this.OID}
            result.trains=[];
            result.po=this.po;
            result.type=this.__getType();
            return result;
        },
        fromJSON:function(json,status)
        {
            status.text=json.text.text;
            status.x=json.point.x;
            status.y=json.point.y;
            status.width=json.point.w;
            status.height=json.point.h;
            status.po=json.po;
            status.OID=json.text.oid;
        }
    });
//    子流程节点
    /**
     * 子流程节点
     * @param canvas
     * @param text
     * @param x
     * @param y
     * @param width
     * @param hieght
     * @param options
     * @constructor
     */
    workflow.shape.SubProcess = function (canvas,text,x,y,options) {
        workflow.shape.SubProcess.base.constructor.call(this, canvas,text,options);//调用基类构造函数
        this._init();//初始化方法
        this.x=x;
        this.y=y;
        this.fillStyle="#fa6f57";
        this.strokeStyle="#fa6f57";
        this.po={};
    };

    workflow.shape.SubProcess.extend(workflow.core.Shape, {
        __getType: function () {
            return "workflow.node.subprocess";
        },
        //初始化方法，子类实现之
        _init: function () {

        },
        //判断屏幕输入点是否在当前点范围内
        _containPoint: function (point) {
            var min_x=this.x;
            var max_x=this.x+this.width;
            var min_y=this.y;
            var max_y=this.y+this.height;
            return point.x<=max_x && point.x>=min_x && point.y>=min_y && point.y<=max_y;
        },

        moveTo:function(point){
            //设为中间点移动到point点
        	this.x=point.x-this.width/2;
            this.y=point.y-this.height/2;
        },

        getLinkedLinePointFrom:function(){
            return {x:this.x+this.width/2,y:this.y+this.height/2}
        },
        getLinkedLinePointTo:function(){
            return [
                {x:this.x+this.width/2,y:this.y},
                {x:this.x+this.width,y:this.y+this.height/2},
                {x:this.x+this.width/2,y:this.y+this.height},
                {x:this.x,y:this.y+this.height/2}
            ];
        },

        //渲染方法
        _render: function () {
            this.__renderBox();
            this.__renderText();

            this.__renderLBox();
            this.__renderRBox();
        },
        __renderBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            var metrics=this.canvas.measureText(this.text);
            this.fontWidth=metrics.width;
            if(metrics.width<80){
                this.width=80;
            }else{
                this.width=metrics.width+40;
            }
            this.height=40;
            this.canvas.fillRect(this.x,this.y,this.width,this.height);
            this.canvas.strokeRect(this.x,this.y,this.width,this.height);
            this.canvas.restore();

        },

        __renderText:function(){
            this.canvas.save();
            //this.canvas.font="bold 10px sans-serif";
            this.canvas.fillStyle="white";
            this.canvas.fillText(this.text,this.x+(this.width-this.fontWidth)/2,this.y+25);
            this.canvas.restore();
        },
        __renderLBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            this.canvas.fillRect(this.x-15,this.y,15,this.height);
            this.canvas.strokeRect(this.x-15,this.y,15,this.height);
            this.canvas.restore();

        },

        __renderRBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            this.canvas.fillRect(this.x+this.width,this.y,15,this.height);
            this.canvas.strokeRect(this.x+this.width,this.y,15,this.height);
            this.canvas.restore();

        },
        toJSON:function() {
            var result={};
            result.point={ x:this.x,y:this.y,w:this.width,h:this.height}
            result.style={fillStyle:this.fillStyle,strokeStyle:this.strokeStyle}
            result.text={text:this.text,cid:this.CID,oid:this.OID}
            result.trains=[];
            result.po=this.po;
            result.type=this.__getType();
            return result;
        },
        fromJSON:function(json,subprocess)
        {
            subprocess.text=json.text.text;
            subprocess.x=json.point.x;
            subprocess.y=json.point.y;
            subprocess.width=json.point.w;
            subprocess.height=json.point.h;
            subprocess.po=json.po;
            subprocess.OID=json.text.oid;
        }

    });
    
//  挂靠流程节点
    /**
     * 挂靠流程节点
     * @param canvas
     * @param text
     * @param x
     * @param y
     * @param width
     * @param hieght
     * @param options
     * @constructor
     */
    workflow.shape.DockProcess = function (canvas,text,x,y,options) {
        workflow.shape.DockProcess.base.constructor.call(this, canvas,text,options);//调用基类构造函数
        this._init();//初始化方法
        this.x=x;
        this.y=y;
        this.fillStyle="#ff00ff";
        this.strokeStyle="#ff00ff";
        this.po={};
    };

    workflow.shape.DockProcess.extend(workflow.core.Shape, {
        __getType: function () {
            return "workflow.node.dockprocess";
        },
        //初始化方法，子类实现之
        _init: function () {

        },
        //判断屏幕输入点是否在当前点范围内
        _containPoint: function (point) {
            var min_x=this.x;
            var max_x=this.x+this.width;
            var min_y=this.y;
            var max_y=this.y+this.height;
            return point.x<=max_x && point.x>=min_x && point.y>=min_y && point.y<=max_y;
        },

        moveTo:function(point){
            //设为中间点移动到point点
        	this.x=point.x-this.width/2;
            this.y=point.y-this.height/2;
        },

        getLinkedLinePointFrom:function(){
            return {x:this.x+this.width/2,y:this.y+this.height/2}
        },
        getLinkedLinePointTo:function(){
            return [
                {x:this.x+this.width/2,y:this.y},
                {x:this.x+this.width,y:this.y+this.height/2},
                {x:this.x+this.width/2,y:this.y+this.height},
                {x:this.x,y:this.y+this.height/2}
            ];
        },

        //渲染方法
        _render: function () {
            this.__renderBox();
            this.__renderText();

            this.__renderLBox();
            this.__renderRBox();
        },
        __renderBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            var metrics=this.canvas.measureText(this.text);
            this.fontWidth=metrics.width;
            if(metrics.width<80){
                this.width=80;
            }else{
                this.width=metrics.width+40;
            }
            this.height=40;
            this.canvas.fillRect(this.x,this.y,this.width,this.height);
            this.canvas.strokeRect(this.x,this.y,this.width,this.height);
            this.canvas.restore();

        },

        __renderText:function(){
            this.canvas.save();
            //this.canvas.font="bold 10px sans-serif";
            this.canvas.fillStyle="white";
            this.canvas.fillText(this.text,this.x+(this.width-this.fontWidth)/2,this.y+25);
            this.canvas.restore();
        },
        __renderLBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            this.canvas.fillRect(this.x-15,this.y,15,this.height);
            this.canvas.strokeRect(this.x-15,this.y,15,this.height);
            this.canvas.restore();

        },

        __renderRBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            this.canvas.fillRect(this.x+this.width,this.y,15,this.height);
            this.canvas.strokeRect(this.x+this.width,this.y,15,this.height);
            this.canvas.restore();

        },
        toJSON:function() {
            var result={};
            result.point={ x:this.x,y:this.y,w:this.width,h:this.height}
            result.style={fillStyle:this.fillStyle,strokeStyle:this.strokeStyle}
            result.text={text:this.text,cid:this.CID,oid:this.OID}
            result.trains=[];
            result.po=this.po;
            result.type=this.__getType();
            return result;
        },
        fromJSON:function(json,subprocess)
        {
            subprocess.text=json.text.text;
            subprocess.x=json.point.x;
            subprocess.y=json.point.y;
            subprocess.width=json.point.w;
            subprocess.height=json.point.h;
            subprocess.po=json.po;
            subprocess.OID=json.text.oid;
        }

    });
    
//  关联流程节点
    /**
     * 关联流程节点
     * @param canvas
     * @param text
     * @param x
     * @param y
     * @param width
     * @param hieght
     * @param options
     * @constructor
     */
    workflow.shape.AssociationProcess = function (canvas,text,x,y,options) {
        workflow.shape.AssociationProcess.base.constructor.call(this, canvas,text,options);//调用基类构造函数
        this._init();//初始化方法
        this.x=x;
        this.y=y;
        this.fillStyle="#ffa500";
        this.strokeStyle="#ffa500";
        this.po={};
    };

    workflow.shape.AssociationProcess.extend(workflow.core.Shape, {
        __getType: function () {
            return "workflow.node.associationprocess";
        },
        //初始化方法，子类实现之
        _init: function () {

        },
        //判断屏幕输入点是否在当前点范围内
        _containPoint: function (point) {
            var min_x=this.x;
            var max_x=this.x+this.width;
            var min_y=this.y;
            var max_y=this.y+this.height;
            return point.x<=max_x && point.x>=min_x && point.y>=min_y && point.y<=max_y;
        },

        moveTo:function(point){
            //设为中间点移动到point点
        	this.x=point.x-this.width/2;
            this.y=point.y-this.height/2;
        },

        getLinkedLinePointFrom:function(){
            return {x:this.x+this.width/2,y:this.y+this.height/2}
        },
        getLinkedLinePointTo:function(){
            return [
                {x:this.x+this.width/2,y:this.y},
                {x:this.x+this.width,y:this.y+this.height/2},
                {x:this.x+this.width/2,y:this.y+this.height},
                {x:this.x,y:this.y+this.height/2}
            ];
        },

        //渲染方法
        _render: function () {
            this.__renderBox();
            this.__renderText();

            this.__renderLBox();
            this.__renderRBox();
        },
        __renderBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            var metrics=this.canvas.measureText(this.text);
            this.fontWidth=metrics.width;
            if(metrics.width<80){
                this.width=80;
            }else{
                this.width=metrics.width+40;
            }
            this.height=40;
            this.canvas.fillRect(this.x,this.y,this.width,this.height);
            this.canvas.strokeRect(this.x,this.y,this.width,this.height);
            this.canvas.restore();

        },

        __renderText:function(){
            this.canvas.save();
            //this.canvas.font="bold 10px sans-serif";
            this.canvas.fillStyle="white";
            this.canvas.fillText(this.text,this.x+(this.width-this.fontWidth)/2,this.y+25);
            this.canvas.restore();
        },
        __renderLBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            this.canvas.fillRect(this.x-15,this.y,15,this.height);
            this.canvas.strokeRect(this.x-15,this.y,15,this.height);
            this.canvas.restore();

        },

        __renderRBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            this.canvas.fillRect(this.x+this.width,this.y,15,this.height);
            this.canvas.strokeRect(this.x+this.width,this.y,15,this.height);
            this.canvas.restore();

        },
        toJSON:function() {
            var result={};
            result.point={ x:this.x,y:this.y,w:this.width,h:this.height}
            result.style={fillStyle:this.fillStyle,strokeStyle:this.strokeStyle}
            result.text={text:this.text,cid:this.CID,oid:this.OID}
            result.trains=[];
            result.po=this.po;
            result.type=this.__getType();
            return result;
        },
        fromJSON:function(json,subprocess)
        {
            subprocess.text=json.text.text;
            subprocess.x=json.point.x;
            subprocess.y=json.point.y;
            subprocess.width=json.point.w;
            subprocess.height=json.point.h;
            subprocess.po=json.po;
            subprocess.OID=json.text.oid;
        }

    });
    
//任务节点
    /**
     * 任务节点
     * @param canvas
     * @param text
     * @param x
     * @param y
     * @param width
     * @param hieght
     * @param options
     * @constructor
     */
    workflow.shape.Task = function (canvas,text,x,y,options) {
        workflow.shape.Task.base.constructor.call(this, canvas,text,options);//调用基类构造函数
        this._init();//初始化方法
        this.x=x;
        this.y=y;
        this.fillStyle="#355878";
        this.strokeStyle="#355878";
        this.po={};

    };

    workflow.shape.Task.extend(workflow.core.Shape, {
        __getType: function () {
            return "workflow.node.task";
        },
        //初始化方法，子类实现之
        _init: function () {

        },
        moveTo:function(point){
            //设为中间点移动到point点
        	this.x=point.x-this.width/2;
            this.y=point.y-this.height/2;
        },
        getLinkedLinePointFrom:function(){
            return {x:this.x+this.width/2,y:this.y+this.height/2}
        },
        getLinkedLinePointTo:function(){
            return [
                {x:this.x+this.width/2,y:this.y},
                {x:this.x+this.width,y:this.y+this.height/2},
                {x:this.x+this.width/2,y:this.y+this.height},
                {x:this.x,y:this.y+this.height/2}
            ];
        },

        //渲染方法
        _render: function () {
            this.__renderBox();
            this.__renderText();
        },

        //判断屏幕输入点是否在当前点范围内
        _containPoint: function (point) {
            var min_x=this.x;
            var max_x=this.x+this.width;
            var min_y=this.y;
            var max_y=this.y+this.height;
            return point.x<=max_x && point.x>=min_x && point.y>=min_y && point.y<=max_y;
        },

        __renderBox:function(){
            this.canvas.save();
            this.canvas.fillStyle=this.fillStyle;
            this.canvas.strokeStyle=this.strokeStyle;
            this.canvas.lineWidth=1;
            this.canvas.shadowOffsetX=-2;
            this.canvas.shadowOffsetY=-2;
            this.canvas.shadowColor="gray";
            this.canvas.shadowBlur=8;
            var metrics=this.canvas.measureText(this.text);
            this.fontWidth=metrics.width;
            if(metrics.width<80){
                this.width=80;
            }else{
                this.width=metrics.width+40;
            }
            this.height=30;
            this.canvas.fillRect(this.x,this.y,this.width,this.height);
            this.canvas.strokeRect(this.x,this.y,this.width,this.height);
            this.canvas.restore();

        },
        __renderText:function(){
            this.canvas.save();
            //this.canvas.font="bold 10px sans-serif";
            this.canvas.fillStyle="white";
            this.canvas.fillText(this.text,this.x+(this.width-this.fontWidth)/2,this.y+20);
            this.canvas.restore();
        },
        toJSON:function() {
            var result={};
            result.point={ x:this.x,y:this.y,w:this.width,h:this.height}
            result.style={fillStyle:this.fillStyle,strokeStyle:this.strokeStyle}
            result.text={text:this.text,cid:this.CID,oid:this.OID}
            result.trains=[];
            result.type=this.__getType();
            result.po=this.po;
            return result;

        },
        fromJSON:function(json,task)
        {
            task.text=json.text.text;
            task.x=json.point.x;
            task.y=json.point.y;
            task.width=json.point.w;
            task.height=json.point.h;
            task.po=json.po;
            task.OID=json.text.oid;
        }
    });

})(jQuery);
	
	



/*--------------------------------------------------------------------
 核心库数据操作函数
 -----------------------------------------------------------------------*/

function getFormat(key,type) {
    var value;
    $.ajax({
        url: "/lib/file/selectFormat.json",//json文件位置
        type: "GET",//请求方式为get
        dataType: "json", //返回数据格式为json
        async: false,
        success: function (data) {//请求成功完成后要执行的方法
            //each循环 使用$.each方法遍历返回的数据date
            var _data = data[type];
            $.each(_data, function (k, item) {
                if (key == item.key) {
                    value = item.value;
                }
            })
        }
    });
    return value;
}

//禁用某个key
function setDisabled(key) {
    $("[key=" + key + "]").attr('disabled', 'disabled');
    $("[key=" + key + "]").addClass('disabled');
    $("#"+key).attr('disabled', 'disabled');
    $("#"+key).addClass('disabled');
};

//取消取消
function setShow(key) {
    $("[key=" + key + "]").show();
    $("#"+key).show();
};
function setHide(key) {
    $("[key=" + key + "]").hide();
    $("#"+key).hide();
};

//取消取消
function setEnabled(key) {
    $("[key=" + key + "]").attr('disabled', false);
    $("[key=" + key + "]").removeAttr('readonly');
    $("[key=" + key + "]").removeClass('disabled');
    $("#"+key).attr('disabled', false);
    $("#"+key).removeClass('disabled');
    $("#"+key).removeAttr('readonly');
};

/**
 * 返回单据的状态
 * @returns {*}
 */
function getStatus() {
    return window.$head.status;
};
/**
 * 设置单据的状态
 * @param status
 */
function setStatus(status) {
    window.$head.status = status;
};


/**
 * 设置头对象模型
 * @param key
 * @returns {*}
 */
function setHeadModel(data) {
	mixer(data,window.$head);
};

/**
 * 获取头对象指定属性的值
 * @param key
 * @returns {*}
 */
function getHeadValue(key) {
    return window.$head[key];
};
/**
 * 获取头对象指定属性的值
 * @param key
 * @returns {*}
 */
function setHeadValue(key, newValue) {
    window.$head[key] = newValue;
};

/**
 * 获取环境对象
 * @returns {*}
 */
function getEnv() {
    return cloneObj(window.$env);
};

/**
 * 设置环境变量参数
 * @param data 
 * @returns
 */
function setEnv(data) {
	 clone(data, window.$env);
};




/**
 * 删除环境对象
 * @returns {*}
 */
function delEnvByKey(key) {
    delete window.$env[key];
};


/**
 * 获取当前用户对象
 * @returns {*}
 */
function curOpertor() {
    return cloneObj(window.$env.user);
};


/**
 * 获取数据集对象：
 *      cos:数据集对象的数据列表
 *      sos:数据集对象的选择列表
 *      co:数据集中当前正在操作的对象
 * @param tableKey
 * @returns {*}
 */
function getDataset(tableKey) {
    return cloneObj(window.$body[tableKey]);
};
/**
 * 获取数据集对象的数据列表
 * @param tableKey
 * @returns {*|Array}
 */
function getRows(tableKey) {
    return cloneObj(window.$body[tableKey].cos);
};


/**
 * 获取数据集对象的数据列表
 * @param tableKey
 * @returns {*|Array}
 */
function getSos(tableKey) {
    return cloneObj(window.$body[tableKey].sos);
};

/**
 * 汇总数据集对象末列的和
 * @param tableKey
 * @param key
 * @returns {*}
 */
function getSum(tableKey, key) {
    var _value = 0;
    var _model = window.$body[tableKey].cos;
    angular.forEach(_model, function (data, index, array) {
        _value += parseFloat(_model[index][key]);
    });
    return _value.toFixed(4);
};

/**
 * 获取数据集中某列的值集合
 * @param tableKey
 * @param key
 * @returns {Array}
 */
function getColsValue(tableKey, key) {
    var _cols = [];
    for (var i = 0; i < window.$body[tableKey].cos.length; i++) {
        _cols.push({key: window.$body[tableKey].cos[i][key]})
    }
    return _cols;
};
/**
 * 获取数据集对象指定行的制定列的值
 * @param tableKey：数据集key
 * @param key：列名称
 * @param row：行号
 * @returns {*}
 */
function getColValue(tableKey, key, row) {
    if (row < window.$body[tableKey].cos.length && row > -1) {
        return window.$body[tableKey].cos[row][key]
    }
};

/**
 * 设置数据集指定行列的值
 * @param tableKey
 * @param key
 * @param row
 * @param newValue
 */
function setColValue(tableKey, colKey, row, newValue) {
    window.$body[tableKey].cos[row][colKey] = newValue
};
/**
 * 设置操作行指定行列的值
 * @param tableKey
 * @param key
 * @param row
 * @param newValue
 */
function setCoColValue(tableKey, colKey,  newValue) {
    window.$body[tableKey].co[colKey] = newValue
};

/**
 * 设置数据集所有列的值
 * @param tableKey
 * @param key
 * @param row
 * @param newValue
 */
function setColsValue(tableKey, colKey, newValue) {
    var rows = window.$body[tableKey].cos;
    for (var i = 0; i < rows.length; i++) {
        rows[i][colKey] = newValue;
    }
};




/*
 插入行
 * @param tableKey
 * @param sos  待插入的行信息
 */
function insertRows(tableKey, sos, clear) {
    if(!sos){
        alert("sos undefined");
        return;
    }
    if (clear && clear == true) {
        window.$body[tableKey].cos.clear();
    }
    for (var i = 0; i < sos.length; i++) {
        window.$body[tableKey].cos.push(sos[i]);
    }
};

//

function testyw(data, beKey, tableKey, setKey) {
    var cos = getRows(tableKey).cos;
    var sum = getSum(tableKey, beKey);
    var val = data - sum - cos[cos.length - 1].beKey;
    setColValue(tableKey, setKey, cos.length - 1, val);
};

//通过头获取明细
function getDetailsByHead(tableName, row, tableKey) {
//    tableName   数据表名称，
//    row  当前选中行信息，
//    tableKey  体tableKey
    var billID = row.BillID;
    var addQuery = this.$env.addQuery;
    var data = {billID: billID, tableName: tableName, code: 'Query'};
    if(addQuery){
        data.addQuery=addQuery;
    }
    $.ajax({
        url: '/spe/route/sqlService',
        type: 'POST', //GET
        async: false,    //或false,是否异步
        data: data,
        timeout: 60000,    //超时时间
        dataType: 'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        beforeSend: function (xhr) {

        },
        success: function (data, textStatus, jqXHR) {
            if (data && data.status == 1) {
                //
                if(row.sjdjbh){
                	setHeadValue('yxsdh',row.sjdjbh);
                    setHeadValue('sjdjbh',row.danjubianhao);
                }
                insertRows(tableKey, data.list, true)
            } else {
                alert('请求明细数据错误');
            }
        },
        error: function (xhr, textStatus) {
            alert(textStatus);
        },
        complete: function () {
            console.log('结束')
        }
    });

};

function getMigrationDetails(tableName, row) {
//	  tableName   数据表名称，
//    row  当前选中行信息，
	var danjubianhao='';
    for(var i=0;i<row.length;i++){
        danjubianhao = danjubianhao + row[i].danjubianhao +',';
    }
    var result;
    $.ajax({
        url: '/caiwu/route/Migrate-Detial',
        type: 'POST', //GET
        async: false,    //或false,是否异步
        data: {danjubianhao: danjubianhao, tableName: tableName},
        timeout: 60000,    //超时时间
        dataType: 'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        beforeSend: function (xhr) {

        },
        success: function (data, textStatus, jqXHR) {
            if (data && data.status == 1) {
                //返回结果集
                result = data.result;
            } else {
                alert('请求明细数据错误');
            }
        },
        error: function (xhr, textStatus) {
            alert(textStatus);
        },
        complete: function () {
            console.log('结束')
        }
    });
    return result;
}

function getYueValue(numb){
	var result;
	$.ajax({
        url: '/caiwu/route/Yue-Value',
        type: 'POST', //GET
        async: false,    //或false,是否异步
        data: {numb:numb},
        timeout: 60000,    //超时时间
        dataType: 'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        beforeSend: function (xhr) {

        },
        success: function (data, textStatus, jqXHR) {
            if (data && data.status == 1) {
                //返回结果集
                result = data.result;
            } else {
                result = 0;
            }
        },
        error: function (xhr, textStatus) {
            alert(textStatus);
        },
        complete: function () {
            console.log('结束')
        }
    });
	return result;
}

//  updateStatus  更新状态
function updateStatus(billID, billKey, status, billType) {
    var result;
    $.ajax({
        url: '/bill/updateBillStatus',
        type: 'POST', //GET
        async: false,    //或false,是否异步
        data: {billID: billID, billKey: billKey, status: status, billType: billType},
        timeout: 60000,    //超时时间
        dataType: 'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        beforeSend: function (xhr) {

        },
        success: function (data, textStatus, jqXHR) {
            if (data) {
                result = data.status;
            }
        },
        error: function (xhr, textStatus) {
            result = 0;
            alert(textStatus);
        },
        complete: function () {
            console.log('结束')
        }
    });
    return result;
};

/*--------------------------------------------------------------------
 map函数
 -----------------------------------------------------------------------*/


/**
 *     * 处理map公式的调度入口
 * 参数：mapkey:""
 *     _env:""
 *     mapType:1,
 *       data:jsonobject,
 *       targetFormKey:""
 * @param mapKey
 */
function map(mapKey, mapType, data, targetFormKey) {
    // var promise=ajax("post","/bill/map",{mapKey:mapKey,mapType:mapType,data:JSON.stringify(data)})
    var result;
    $.ajax({
        url: '/bill/map',
        type: 'POST', //GET
        async: false,    //或false,是否异步
        data: {mapKey: mapKey, mapType: mapType, data: JSON.stringify(data), targetFormKey: targetFormKey},
        timeout: 60000,    //超时时间
        dataType: 'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        beforeSend: function (xhr) {
            console.log(xhr)
            console.log('发送前');
        },
        success: function (data, textStatus, jqXHR) {
            if (data.status == 1) {
                //
                if (data.result) {
                    if (targetFormKey) {
                        window.sessionStorage.setItem(targetFormKey, JSON.stringify(data.result));
                        window.location.href = "/bill/view/bill?billKey=" + targetFormKey;
                    } else {
                        //    无需跳转的时候执行的方法
                        result = data.result;
                    }
                } else {
                    alert("转换结果为空");
                }

            } else if (data.status == 0) {
                var error = JSON.parse(data.error);
                alert(error[0].message + "，错误代码：" + error[0].errNo);
            }
            else {
                alert("转换出现未知错误");
            }

        },
        error: function (xhr, textStatus) {
            alert(textStatus);
        },
        complete: function () {
            console.log('结束')
        }
    });
    return result;
};

/**
 * 请求远程方法
 * @param src 请求URL
 * @param data 请求参数
 * @param isAsync  是否异步
 * @param reqType 请求类型：post | get
 * @returns
 */
function callRemoteMethod(src, data, isAsync, reqType) {
    var result;
    $.ajax({
        url: src, //地址
        type: reqType, // POST | GET
        async: isAsync==true?false:true,    //或false,是否异步
        data: data,
        timeout: 60000,    //超时时间
        dataType: 'json',    //返回的数据格式：json/xml/html/script/jsonp/text
        beforeSend: function (xhr) {
            console.log(xhr)
            console.log('发送前');
        },
        success: function (data, textStatus, jqXHR) {
            if (data.status == 1) {
                if (data.result) {
                	result = data.result;
                }
            } else if (data.status == 0) {
                var error = JSON.parse(data.error);
                alert(error[0].message + "，错误代码：" + error[0].errNo);
            }
            else {
                alert("请求出现未知错误");
            }
        },
        error: function (xhr, textStatus) {
            alert(textStatus);
        },
        complete: function () {
            console.log('结束')
        }
    });
    return result;
};


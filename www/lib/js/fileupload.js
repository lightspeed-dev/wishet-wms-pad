function loadFile () {
    var formdata = new FormData($( "#uploadForm" )[0]);
    NProgress.start();
    $.ajax({
        type: 'POST',
        url: '/common/uploadFile',
        data: formdata,
        async: false,
        /**
         *必须false才会自动加上正确的Content-Type
         */
        contentType: false,
        /**
         * 必须false才会避开jQuery对 formdata 的默认处理
    * XMLHttpRequest会对 formdata 进行正确的处理
    */
        processData: false
    }).then(function (result) {
		alert("上传成功");
		$("#workflowFileBbtn").trigger('click');
        NProgress.done();
    }, function (error) {
        alert("failed");
        NProgress.done();
    });
}

//
var imageType={    "jpg":1,    "jpeg":1,    "JPG":1,    "JPEG":1,    "png":1,    "PNG":1,    "gif":1,    "GIF":1,    "bmp":1,    "BMP":1,    "doc":1,    "docx":1,    "DOC":1,    "DOCX":1,    "xls":1,    "xlsx":1,    "XLS":1,    "XLSX":1,    "ppt":1,    "PPT":1,    "pptx":1,    "PPTX":1,    "pdf":1,    "PDF":1,    "txt":1,    "TXT":1,    "wps":1,    "WPS":1,    "et":1,    "ET":1,    "dps":1,    "DPS":1};
function upload() {
    debugger;
    var names = $("#attach").val().split('.');
    var nameLen= names.length-1;
    var fileName=document.getElementById("attach");
    var fileSize = fileName.files;
    var fileSizeKb=0;
    for(var i=0;i<fileSize.length;i++){
        fileSizeKb += fileSize[i].size;
    }
    var fileSizeMb = fileSizeKb/1024/1024;//转换为kb
    console.log(fileSizeMb);
    if (imageType[names[nameLen]]!= '1') {
        $("#error").html("请上传以下格式文件：<br>jpg、png、doc、docx、xls、xlsx、ppt、pptx、pdf、txt、wps、et、dps");
        $("#error").show();
        $('#attachBtn').attr('disabled','disabled');
        return;
    }else if(fileSizeMb>10){
        $("#error").html("单次上传文件最大支持10M");
        $("#error").show();
        $('#attachBtn').attr('disabled','disabled');
        return;
    }else{
        $("#error").hide();
        $('#attachBtn').removeAttr('disabled');
    }
}
function del(id) {
    if(confirm("确定删除该附件吗？")){
        NProgress.start();
        $.ajax({
            type: 'POST',
            url: '/common/delFile',
            data: {id:id},
            async: false,
        }).then(function (result) {
            alert("删除成功");
            NProgress.done();
            $("#workflowFileBbtn").trigger('click');
        }, function (error) {
            alert("删除失败");
            NProgress.done();
        });
    }
}

$(function () {
    $('.attachList img').each(function (i,item) {
        var _thisSrc=$(item).attr('src');
        var _imgType=_thisSrc.split('.');
        var _thisType=_imgType[_imgType.length-1];
        console.log(_thisType);
        var fileName = "";
        for(var i = 0; i<_imgType.length -1; i++){
            fileName += _imgType[i] + ".";
        }
        fileName = fileName.substring(0, fileName.length -1);
        if(_thisType=='png' || _thisType=='jpg' || _thisType=='bmp' || _thisType=='jpeg' || _thisType=='PNG' || _thisType=='JPG' || _thisType=='BMP' || _thisType=='JPEG'){
            $(item).attr('src', fileName + "_thumb." + _thisType );
        }else{
            _thisType.toLowerCase();
            if(_thisType=='doc'|| _thisType=='docx'|| _thisType=='wps'){
                $(item).attr('src','/lib/images/doc.jpg')
            }else if(_thisType=='xls'|| _thisType=='xlsx'|| _thisType=='et'){
                $(item).attr('src','/lib/images/xls.jpg')
            }else if(_thisType=='ppt'|| _thisType=='pptx'|| _thisType=='dps'){
                $(item).attr('src','/lib/images/ppt.jpg')
            }else if(_thisType=='pdf'){
                $(item).attr('src','/lib/images/pdf.jpg')
            }else if(_thisType=='txt'){
                $(item).attr('src','/lib/images/txt.jpg')
            }else{
                $(item).attr('src','/lib/images/weizhi.jpg')
            }
        }
    });
});

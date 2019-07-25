/**
 * 文件上传组件js
 *           file_ext_name:
 *              jpg,jpeg,bmp,gif,png,pdf,doc,docx,xls,xlsx
 * }
 */
function __$AjaxUpload(tid, fid, preSend, sucess, fail, del, ext) {
    var default_ext = ["jpg", "jpeg", "txt", "gif", "png", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];


    var formdata = new FormData();
    var fileObj = document.getElementById(fid).files;
    if (fileObj.length < 1) {
        return;
    }

    var filename = fileObj[0].name;
    var status = false;
    for (var i = 0; i < default_ext.length; i++) {
        if (filename.indexOf(default_ext[i]) > 0) {
            status = true;
            break;
        }
    }
    if (!status) {
        alert("不支持的文件格式.");
        return;
    }

    $("#" + tid).on("click", "button", function () {
        var filename = $(this).attr("filename")
        $(this).parent().parent().remove();
        if (del && typeof del == 'function') {
            del(filename);//调用
        }
    });
    for (var i = 0; i < fileObj.length; i++)
        formdata.append("file" + i, fileObj[i]);
    if (preSend && typeof preSend == 'function') {
        preSend();//调用
    }
    $.ajax({
        type: 'POST',
        url: '/common/uploadFile',
        data: formdata,
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
        /*
        if (result.status && result.status == 1) {
            $("#" + tid).append($("<tr><td align='center'><a href='" + result.url + "' target='_blank'>" + result.filename + "</a></td><td><button type='button' class='am-btn am-btn-primary  am-btn-xs' filename='" + result.filename + "'>删除</button></td></tr>"));
        }
        */
        if (sucess && typeof sucess == 'function') {
            sucess(result);//调用
        }
    }, function (error) {
        //failCalfi
        if (fail && typeof fail == 'function') {
            fail(error);//调用
        }
    });
    document.getElementById(fid).value = "";

}

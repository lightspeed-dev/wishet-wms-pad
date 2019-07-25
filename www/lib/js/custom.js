/**
 * Created by Shao on 2017/2/9.
 */
//弹出进度条
var NProgress={
  start:function () {
    if($(".loading").length>0){
      $(".loading").show();
    }else{
      var html='<div class="loading"><div class="loadingwrap"></div><div class="sk-circle">\n' +
        '      <div class="sk-circle1 sk-child"></div>\n' +
        '      <div class="sk-circle2 sk-child"></div>\n' +
        '      <div class="sk-circle3 sk-child"></div>\n' +
        '      <div class="sk-circle4 sk-child"></div>\n' +
        '      <div class="sk-circle5 sk-child"></div>\n' +
        '      <div class="sk-circle6 sk-child"></div>\n' +
        '      <div class="sk-circle7 sk-child"></div>\n' +
        '      <div class="sk-circle8 sk-child"></div>\n' +
        '      <div class="sk-circle9 sk-child"></div>\n' +
        '      <div class="sk-circle10 sk-child"></div>\n' +
        '      <div class="sk-circle11 sk-child"></div>\n' +
        '      <div class="sk-circle12 sk-child"></div>\n' +
        '    </div></div>\n';
      $("body").append(html);
    }
  },
  done:function () {
    $(".loading").hide();
  }
}

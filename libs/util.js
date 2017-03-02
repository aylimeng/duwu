/**
 * Created by fanfan on 15-4-1.
 * 自定义公共js--需要使用的时候，引入此js
 * 后续变大后可能得压缩
 */

var MW = MW || {};

//MW.BASE_SERVER_URL = "http://123.59.41.176:8080";
//MW.BASE_SERVER_URL = "http://106.75.77.92:8080";
MW.BASE_SERVER_URL = "https://api.duwu.mobi";

MW.DEEPLINK_APPKEY = "b9c3e38a736d5c43";

/**
 * 跳转到下载猫爪APP界面
 */
function goDownloadApp(){
    var url = window.location.href;
    var params = "";
    if(url.indexOf("?")>0){
        params = url.substr(url.indexOf("?"));
    }
    //var url = "http://duwu.mobi/scripts/duwudownall.php"+params;
    window.location.href = "https://duwu.mobi";
}
function goAppstore(){
    var url = window.location.href;
    var params = "";
    if(url.indexOf("?")>0){
        params = url.substr(url.indexOf("?"));
    }
    var url = "https://duwu.mobi/scripts/duwudownall.php"+params;
    window.location.href = url;
}

/**
 * 从页面打开app指定内容，ios9.0+
 * 参数含义参考首页广告 ads
 * 有分享
 * */
function dlParamsShare(type,item,sc,sdes,sfunction,sicon){
	// 组装参数
	var params = {
	    inapp_data: {
	        type: type,
	        item: item,
	        share: {
					c: sc,
					sdes: sdes,
					sfunction: sfunction,
					sicon: sicon,
					url:item
				},
	    }
	};
	return params;
}
/**
 * 从页面打开app指定内容，ios9.0+
 * 参数含义参考首页广告 ads
 * 无分享
 * */
function dlParams(type,item){
	// 组装参数
	var params = {
	    inapp_data: {
	        type: type,
	        item: item,
	    }
	};
	return params;
}
/**
 * 从页面打开app指定内容，ios9.0+
 * 空的参数
 * */
function dlParamsEmpty(){
	// 组装参数
	var params = {
	};
	return params;
}

/**
 * 获取request中的请求参数
 * @param name 参数名
 * @returns {参数值}
 */
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return null;
};

/**
 * 获取当前请求的基本URL
 * @returns {string}
 */
function getBaseUrl(){
    var hostUrl = window.location.host;
    var url = window.location.protocol + "//"+hostUrl;
    return url;
}

/**
 * 发请求
 * @param url
 * @param param
 * @param callback
 */
function sendRequest(url, param, callback){
    var reqUrl = MW.BASE_SERVER_URL + url;
    $.post(reqUrl, eval(param), function(resp, status, xhr) {
        if (status == 'success') {
            if (xhr && xhr.responseText) {
                var jsonData = JSON.parse(xhr.responseText);
                //alert(jsonData['message']);
                if(callback){
                    callback(jsonData);
                }
            }

        }
    });
}

/**
 * 手机号验证
 * @param mobile
 * @returns {boolean}
 */
function isMobile(mobile){
    var regStr = /^1[3,4,5,7,8]{1}\d{9}$/;
    return regStr.test(mobile);
}
/*******
 * 判断是否是用微信打开的
 * @returns {Boolean}
 */
function is_weixn(){  
    var ua = navigator.userAgent.toLowerCase();  
    if(ua.match(/MicroMessenger/i)=="micromessenger") {  
        return true;  
    } else {  
        return false;  
    }  
} 
//手机端判断各个平台浏览器及操作系统平台
function checkPlatform(){
	var clientOs = "other";
  if(/android/i.test(navigator.userAgent)){
	  clientOs = "Android";//这是Android平台下浏览器
  }
  if(/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)){
	  clientOs = "IOS";//这是iOS平台下浏览器
  }
  if(/Linux/i.test(navigator.userAgent)){
	  clientOs = "linuxL";//这是Linux平台下浏览器
  }
  if(/Linux/i.test(navigator.platform)){
	  clientOs = "linux";//这是Linux操作系统平台
  }
  if(/MicroMessenger/i.test(navigator.userAgent)){
	  clientOs = "weiChat";//这是微信平台下浏览器
  }
  return clientOs;
}

/* html调起APP支付时的json数据
 * productid:商品id
 * num:购买数量
 * type:0：不弹窗  1：app弹购买窗  
 * */
function packagePayJson(type,productid,num){
	return 'MOITeamAPPPay:{"productid":"'+productid+'","num":"'+num+'","type":"'+type+'"}';
}
/* html调起APP分享时的json数据
 * c:分享时的title
 * url:分享链接
 * sfunction:上报分享接口时的c字段
 * sicon:分享时的图片
 * sdes:分享时的描述文字
 * */
function packageShareJson(c,url,sfunction,sicon,sdes){
	return 'MOITeamShare:{"c":"'+c+'","url":"'+url+'","sfunction":"'+sfunction+'","sicon":"'+sicon+'","sdes":"'+sdes+'"}';
}



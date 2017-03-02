
//微信分享图标
WX_SHARE_ICON = "http://crop.duwu.mobi/catfiles/homeAd/1434514329219.jpg?w=300&h=300";
//颜值分享语
WX_SHARE_TITLE = "毒物-极尽世间好物，专注提升逼格";
//重置 分享图标
function resetPicUrl(picurl){
	 if(picurl != null && picurl != ''){
	    	picurl = picurl.replace("image.duwu.mobi", "crop.duwu.mobi");
	    	picurl = picurl + "?w=300&h=300";
    }
    return picurl;
}

/******
 *  微信绑定
 */
function shareConfig(shareurl,sTitle,sDesc,sPic,params,functionContent){
	//这一步如果使用的是window.location.href这种方式得到的当前页链接就一定要encodeURIComponent()，不然，2次分享以后，自定义信息将会消失
	shareurl = shareurl+params;//encodeURIComponent(pageUrl)+params;
	setConfig(shareurl,sTitle,sDesc,sPic,functionContent);
}
/*****
 * 微信分享 方法
 * pageUrl 当前页面地址
 * shareurl 分享链接
 * sTitle 分享标题
 * sDesc 分享描述
 * sPic 分享的图标
 */
function setConfig(shareurl,sTitle,sDesc,sPic,functionContent){
	 var curUrl = window.location.href;
//	    var cParams = "";
//	    if(curUrl.indexOf("?")>0){
//	        cParams = curUrl.substr(curUrl.indexOf("?"));
//	    }
//	    pageUrl = pageUrl+cParams;
//	    shareurl = shareurl+cParams;
		//微信浏览器 标识，有时候获取不到
		var ua = window.navigator.userAgent;
		var url = MW.BASE_SERVER_URL + "/duwu/weiChat/wechatShare.json";
		 var param = new FormData();
	    param.append("ua",ua);
	    param.append("surl",curUrl);
	    
		$.ajax({
	       url: url,
	       type: 'POST',
	       data: param,
	       contentType: false, //必须
	       processData: false, //必须
	       success:function(data) {
	           var tmpStatus = data['status'];
	           if(tmpStatus == 200){
	               var result = data['attachment'];
	               if(result != null){
	                   wx.config({
	                       debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
	                       appId: result['appId'], // 必填，公众号的唯一标识
	                       timestamp: result['timestamp'], // 必填，生成签名的时间戳
	                       nonceStr: result['nonceStr'], // 必填，生成签名的随机串
	                       signature: result['signature'],// 必填，签名，见附录1
	                       jsApiList: [
	                           'onMenuShareTimeline',
	                           'onMenuShareAppMessage'
	                       ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	                   });
	               }
	           }else{
	               alert(data['message']);
	           }
	       },
	       error : function() {
	           //alert('errorddddd');
	       }
	   });
		
	    wx.ready(function () {
	    	/***微信“分享给好友”接口 ***/
	        wx.onMenuShareAppMessage({
	            title: sTitle, // 分享标题
	            desc: sDesc,// 分享描述
	            link: shareurl,// 分享链接	
	            imgUrl: sPic,// 分享图标
	            success: function (res) {
//	                alert('2111');
	            	submitShareInfo(functionContent);
	            },
	            cancel: function (res) {
//	                alert('2333');
	            },
	        });
				/**** 分享到朋友圈 ****/
	        wx.onMenuShareTimeline({
	            title: sTitle,// 分享标题 
	            link: shareurl,// 分享链接 
	            imgUrl: sPic,// 分享图片
	            success: function (res) {
//	                alert('55555');
	            	submitShareInfo(functionContent);
	            },
	            cancel: function (res) {
//	                alert('53333');
	            },
	        });
	    });
}
/*******
 * 上报 分享记录
 * functionContent  分享记录接口(/duwu/share/info.json)中的c规则
 */
function submitShareInfo(functionContent){
	if(functionContent != ""){
		$.ajax({
			url: MW.BASE_SERVER_URL + "/duwu/share/info.json?uid=123&c="+functionContent+"&pname=html&test=1",
			type: 'POST',
			contentType: false, //必须
			processData: false, //必须
			success:function(data) {
			},
			error : function() {
				//alert('errorddddd');
			}
		});
	}
}
/******
 * 微信公众号 登录验证，需要用户自己授权
 * redirect_uri 用户授权后的回调链接 只能是域名方式
 * state 为了我们自己做校验用的，这个数当授权成功后微信会给我们传回来，使用随机数就可以
 */
function weiChatLogin(redirect_uri,state){
	//回调链接一定要惊醒urlencode编码
	redirect_uri=encodeURIComponent(redirect_uri);  
	window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx57c2410c38a38c43&redirect_uri="+redirect_uri+"&response_type=code&scope=snsapi_userinfo&state="+state+"#wechat_redirect";
}
/******
 * 得到微信登录用户 opendId
 * code : weiChatLogin()得到的cod
 * f 1:颜值存钱罐参加者   2：颜值存钱罐 帮助者
 */
function getWeiChatOpenId(code,f){
	$.ajax({
        url:MW.BASE_SERVER_URL+"/duwu/weiChat/getOpenId.json?code=" + code,
        type:"GET",
        success:function(msg){
        	var result = msg.attachment.openid+","+msg.attachment.nickname;
        	if(1 == f){
        		showWeiChatData(result);
        	}else if(2 == f){
        		showWeiChatDataForHelper(result);
        	}
        },
        error:function(){
            alert("登录失败");
        }
     });
}
/******
 * 根据 微信授权code，获取用户信息
 * @param code
 * @param f
 */
function getUserByWeiChatOpenId(code){
	var url = MW.BASE_SERVER_URL+"/duwu/vp/u.json?code=" + code;
	$.ajax({
        url:url,
        type:"post",
        async: false,
        success:function(msg){
        	if(msg.status == 200){
        		var Person = msg.attachment;
        		// alert(d.token+"_"+d.user.uid);
				var token = Person.token;
				var uid = Person.user.uid;
				// return Person.token+"_"+Person.user.uid;
        		// return Person;
				setCookie('token',token,30);
				setCookie('uid',uid,30);
        	}else{
        		// alert(msg.message);
        	}
        },
        error:function(){
            alert("登录失败");
        }
     });
}

// 测试cookie取值
//   function text(scope) {
//   	alert(123);
// 	  $.ajax({
// 	  url:'http://api.duwu.mobi/duwu/vp/zdlist.json?u=123&start=0&size=10',
// 	  type:'get',
// 	  success:function(response){
// 	  		console.log(response);
// 		  setCookie('uid',291601355);
// 		  console.log('zz:'+getCookie('uid'));
//
// 	  },
// 	  error:function(){}
// 	  }
//
//   )
//   }


/*cokie*/
function setCookie(c_name,value,expiredays){
	var exdate=new Date();
	exdate.setDate(exdate.getDate()+expiredays);
	document.cookie=c_name+ "=" +escape(value)+
		((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
}

//取cookie
function getCookie(c_name){
	if (document.cookie.length>0){
		c_start=document.cookie.indexOf(c_name + "=");
		if (c_start!=-1){
			c_start=c_start + c_name.length+1;
			c_end=document.cookie.indexOf(";",c_start);
			if (c_end==-1) c_end=document.cookie.length;
			return unescape(document.cookie.substring(c_start,c_end))
		}
		// alert(c_name);
	}
}

/*毒物商店服务号分享代码*/
var shareUrl = window.location.href;
var dataForWeixin = {
	appId: "wx57c2410c38a38c43",
	MsgImg: "http://image.duwu.mobi/catfiles/37/7923/7e25577923324.jpg",//显示图片
	url: shareUrl,//跳转地址
	title: "毒物-极尽世间好物,专注提升逼格",//标题内容
	desc: "一家专注提升您的体验的",//描述内容
	fakeid: "",
	callback: function () { }
};
(function () {
	var onBridgeReady = function () {
		WeixinJSBridge.on('menu:share:appmessage', function (argv) {
			WeixinJSBridge.invoke('sendAppMessage', {
				"appid": dataForWeixin.appId,
				"img_url": dataForWeixin.MsgImg,
				"img_width": "120",
				"img_height": "120",
				"link": dataForWeixin.url,
				"desc": dataForWeixin.desc,
				"title": dataForWeixin.title
			}, function (res) { (dataForWeixin.callback)(); });
		});
		WeixinJSBridge.on('menu:share:timeline', function (argv) {
			(dataForWeixin.callback)();
			WeixinJSBridge.invoke('shareTimeline', {
				"img_url": dataForWeixin.TLImg,
				"img_width": "120",
				"img_height": "120",
				"link": dataForWeixin.url,
				"desc": dataForWeixin.desc,
				"title": dataForWeixin.title
			}, function (res) { });
		});
		WeixinJSBridge.on('menu:share:weibo', function (argv) {
			WeixinJSBridge.invoke('shareWeibo', {
				"content": dataForWeixin.title,
				"url": dataForWeixin.url
			}, function (res) { (dataForWeixin.callback)(); });
		});
		WeixinJSBridge.on('menu:share:facebook', function (argv) {
			(dataForWeixin.callback)();
			WeixinJSBridge.invoke('shareFB', {
				"img_url": dataForWeixin.TLImg,
				"img_width": "120",
				"img_height": "120",
				"link": dataForWeixin.url,
				"desc": dataForWeixin.desc,
				"title": dataForWeixin.title
			}, function (res) { });
		});
	};

	if (document.addEventListener) {
		document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
	} else if (document.attachEvent) {
		document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
		document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
	}
})();
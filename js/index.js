// 1首页列表
myApp.controller('dongtai', function($scope, $http, $state) {
	// 获取用户uid和授权
	var uid = getCookie('uid');
	if(!uid){//如果没有uid
		var code = getQueryString("code");// 获取微信API返回的code
		if(!code){//如果url中没有code参数
			uid = 0;
			setCookie('uid',uid);
		}else {
			getUserByWeiChatOpenId(code);//调用code生成的用户uid (cookie)
			uid = getCookie('uid');
		}
	}

	// 分页
	var pages = 2;
	var stv = setInterval(function(){	
		$scope.docuHgt = parseInt($(document).height()); 
		$scope.winHgt =  parseInt($(window).height()); 
		$scope.scrTop = parseInt($(document).scrollTop());
		if($scope.scrTop>=$scope.docuHgt-$scope.winHgt-10){
			$('.loadingBot').show();
			getMore(pages*5);
			pages++;		
		}	
	},500);
   getMore('5');
function getMore(pages){
	$http.get("https://api.duwu.mobi/duwu/vp/zdlist.json?test=1&u="+uid+"&start=0&size="+pages)
		.success(function(response) {
			$scope.data = response.attachment.datas;
			$scope.ads = response.attachment.ads;
			$scope.total = response.attachment.total;
			pages/5==Math.ceil($scope.total/5)?$('.loadingBot').hide():$('.loadingBot').fadeOut();
			if(pages/5>Math.ceil($scope.total/5)){
				clearInterval(stv)
			}

			// banner广告
		    $scope.ad = function (type,item) {
		    	if(type==2) {$state.go('tui_recommend', {id:item})}//商品详情
		    	if(type==5) {window.location.href='https://www.duwu.mobi/share/special.html?themeid='+item}//帖子专题
		    	if(type==6) {$state.go('shangpin', {pid:item})}//商品
		    	if(type==7) { window.location.href='http://duwu.mobi/'}//打开app
			}
		});
}



});
// 2首页列表详情
myApp.controller('xiangqing', function($scope, $http, $state, $stateParams) {
	$scope.id = $stateParams.id;
	var uid = getCookie('uid');
	// 外接详情页面判断
	if(!uid){
		var code = getQueryString("code");// 获取微信API返回的code
		if(!code){
			uid = 0;
			setCookie('uid',uid);
		}else {
			getUserByWeiChatOpenId(code);//调用code生成的用户uid (cookie)
			uid = getCookie('uid');
		}
	}
	// 接口数据
	$http.get("https://api.duwu.mobi/duwu/vp/topicInfo.json?test=1&u=" + uid + "&tid=" + $scope.id)
		.success(function(response) {
			$scope.data = response.attachment;
			$scope.pid = findpid($scope.data.topic.imageText);
			// 遍历出产品id
			function findpid(obj) {
				for(var i = 0; i < obj.length; i++) {
					if(obj[i].product) {
						return obj[i].product.id;
					}
				}
			}

			//分享到朋友圈
			shareConfig(
				'https://www.duwu.mobi/wxduwu/home.html#/tui_recommend',
				$scope.data.topic.title,
				$scope.data.topic.imageText[0].c,
				$scope.data.firstpic.img,
				'?id='+$scope.data.topic.id
			);
		});


	// 跳转商品详情
	$scope.goShangpin = function (type,item,tid) {
		if(type==3)
		{$state.go('shangpin', {pid:item})}
		if(type==0)
		{
			window.location="https://www.duwu.mobi/down/topicInfo.html?tid="+tid;
		}
	};
	// 控制头部页面隐藏
	$scope.tuiHeadHide = function () {
		$('.tui_head_pnum').css('display','block');
		$('.tui_animate').removeClass('tui_animate_show')
	};

	// 控制头部页面显示
	$scope.tuiAnimata = function () {
		$('.tui_head_pnum').hide();
		$('.showMoreGoods').addClass('tui_animate_show');
		$('.showMoreGoods').css('display','block');
	};
	var bd = document.getElementsByTagName("body")[0];
	bd.addEventListener('touchmove', function(event) {
		$('.tui_head_pnum').show();
		$('.showMoreGoods').css('display','none');
	});



});
//3商品详情
myApp.controller('shangpin', function($scope, $http, $state, $stateParams,$cookieStore,$rootScope) {
	$scope.pid = $stateParams.pid;
	var uid = getCookie('uid');
	if(!uid){
		var code = getQueryString("code");// 获取微信API返回的code
		if(!code){
			uid = 0;
			setCookie('uid',uid);
		}else {
			getUserByWeiChatOpenId(code);//调用code生成的用户uid (cookie)
			uid = getCookie('uid');
		}
	}




	// 接口数据
	$http.get("https://api.duwu.mobi/duwu/vp/pInfo.json?u="+uid+"&productid=" +$scope.pid+"&test=1")
		.success(function(response) {
			$scope.data = response.attachment;
			//商品详情 分享到朋友圈
			shareConfig(
				'https://www.duwu.mobi/wxduwu/home.html#/shangpin',
				$scope.data.pinfo.title,
				'极尽世间好物,引领品质生活',
				$scope.data.pinfo.pic.img,
				'?pid='+$scope.data.pinfo.id
			);
		});


	$scope.catBtn = function(isAdd) {
		$scope.isAddCart = isAdd;//切换按钮
		$('.floating').css('display', 'block');//弹出层
		$("body,html").css({"overflow":"hidden"});
		$(".overlay").css({ "width": $(document).width(), "height": $(document).height(),"display":'block' });
		$scope.bg = ['current'];//样式的改变
		$scope.bga = ['current'];

		$scope.pid = $stateParams.pid;
		$http.get("https://api.duwu.mobi/duwu/vp/pInfo.json?u="+uid+"&productid=" + $scope.pid) //(productid=1)为测试数据接口参数
			.success(function(response) {
				$scope.data = response.attachment;
				console.log($scope.data)
				$scope.storeid = $scope.data.pinfo.storeId;
				$scope.bga[0] = 'current';
				$scope.bg[0] = 'current';
				$scope.count = 1;

				// 选择切换
				if($scope.data.pinfo.skus.length==1 && $scope.data.pinfo.standards.length==1){
					$scope.count = 1;
					$scope.price1 = $scope.data.pinfo.skus[0].price;//被选商品价格
					$scope.reserve = $scope.data.pinfo.skus[0].reserve;
					$scope.skuid = $scope.data.pinfo.skus[0].id;
				}	else if($scope.data.pinfo.standards.length==1){
					$scope.aaa = $scope.data.pinfo.standards[0].info[0].id;
					$scope.price1 = getprice1($scope.aaa).price;//被选商品价格
					$scope.reserve = getprice1($scope.aaa).reserve;
					$scope.skuid = getprice1($scope.aaa).id;
					$scope.isCurrent = function(index, that) {
						$scope.count = 1;
						$scope.bg = [];
						$scope.bg[index] = 'current';
						$scope.aaa = that;
						$scope.price1 = getprice1($scope.aaa).price;
						$scope.reserve = getprice1($scope.aaa).reserve;
						$scope.skuid = getprice1($scope.aaa).id;
					};
				} else{
					$scope.aaa = $scope.data.pinfo.standards[0].info[0].id;
					$scope.bbb = $scope.data.pinfo.standards[1].info[0].id;
					$scope.price1 = getprice($scope.aaa, $scope.bbb).price;//被选商品价格
					$scope.reserve = getprice($scope.aaa, $scope.bbb).reserve;
					$scope.skuid = getprice($scope.aaa, $scope.bbb).id;
					$scope.isCurrent = function(index, that) {
						$scope.count = 1;
						$scope.bg = [];
						$scope.bg[index] = 'current';
						$scope.aaa = that;
						$scope.price1 = getprice($scope.aaa, $scope.bbb).price;
						$scope.reserve = getprice($scope.aaa, $scope.bbb).reserve;
						$scope.skuid = getprice($scope.aaa, $scope.bbb).id;
					};
					$scope.Current = function(index, that) {
						$scope.count = 1;
						$scope.bga = [];
						$scope.bga[index] = 'current';
						$scope.bbb = that;
						$scope.price1 = getprice($scope.aaa, $scope.bbb).price;
						$scope.reserve = getprice($scope.aaa, $scope.bbb).reserve;
						$scope.skuid = getprice($scope.aaa, $scope.bbb).id;

					};
				}
				function getprice(aaa, bbb) {
					if(aaa != '' && bbb != '') {
						for(var i = 0; i < $scope.data.pinfo.skus.length; i++) {
							if($scope.data.pinfo.skus[i].propertis == aaa + ':' + bbb) {
								return $scope.data.pinfo.skus[i];
							}
						}
					}
				}
				function getprice1(aaa) {
					if(aaa != '') {
						for(var i = 0; i < $scope.data.pinfo.skus.length; i++) {
							if($scope.data.pinfo.skus[i].propertis == aaa ) {
								return $scope.data.pinfo.skus[i];
							}
						}
					}
				}
				// 立即购买按钮
				$scope.btn = function() {
					$("body,html").css({"overflow":""});
					if(uid==0){
						alert('登录后才能购买');
						disdiv()
					}else {
						var json=[{
							"storeId": $scope.storeid,
							"postscript":"",
							"products":[{'skuId':$scope.skuid,'pnum':$scope.count}]
						}];
						$rootScope.propertis = JSON.stringify(json);
						$http({
							url:"https://api.duwu.mobi/duwu/vorder/orderInfo.json?u="+uid+"&propertis="+$rootScope.propertis+"&test=1",
							method: 'POST',
							headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8 '}
						}).success(function(data) {
							console.log('成功')
						}).error(function(data) {
							console.log('失败')
						});
					}

				};
				// 加入购物车按钮
				$scope.btn1 = function() {
					if(uid==0){
						alert('登录后才能添加购物车');
						disdiv()
					}else {
						$http({
							url:"https://api.duwu.mobi/duwu/vbc/edit.json?u="+uid+"&productid="+$scope.pid+"&pnum="+$scope.count+"&skuId="+$scope.skuid+"&test=1",
							method: 'POST',
							headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8 '}
						}).success(function(data) {
							console.log('成功');
							$('.floating').css('display', 'none');
							$('.overlay').css('display', 'none');
							$("body,html").css({"overflow":""});
							alert('已加入购物车')
						}).error(function(data) {
							console.log('失败')
						});
					}

				}
			});
	};


	// 遮罩消失
	$scope.overlay = function() {
		disdiv()
	};
	function disdiv() {
		$('.floating').css('display', 'none');
		$('.overlay').css('display', 'none');
		$("body,html").css({"overflow":""});
	}
});
// 确认订单页面
myApp.controller('qrorder', function($scope, $http, $state,$stateParams) {
	$scope.propertis = $stateParams.propertis;
	var uid = getCookie('uid');
	if(uid==0){
		var cUrl = window.location.href;
		var a = 123;
		weiChatLogin(cUrl,a);
		var code = getQueryString("code");// 获取微信API返回的code
		getUserByWeiChatOpenId(code);//调用code生成的用户uid (cookie)
		uid = getCookie('uid');
	}

	$http.post("https://api.duwu.mobi/duwu/vorder/orderInfo.json?u="+uid+"&propertis="+$scope.propertis+"&test=1")
		.success(function(response) {
			$scope.data = response.attachment;

			// 非自营商品无法购买
			if($scope.data.datas==''){
				alert('该商品无法购买');
			}

		});

	// 转换.00
	$scope. returnFloat = function(value){
		var value=Math.round(parseFloat(value)*100)/100;
		var xsd=value.toString().split(".");
		if(xsd.length==1){
			value=value.toString()+".00";
			return value;
		}
		if(xsd.length>1){
			if(xsd[1].length<2){
				value=value.toString()+"0";
			}
			return value;
		}
	};


	// 提交订单支付
	$scope.tijiao = function () {
		if($scope.data.to==''){
			alert('请填写收货地址');
		}else {
		$scope.takeoverid = $scope.data.to[0].id;
		$http.post("https://api.duwu.mobi/duwu/vorder/affirm.json?u="+uid+"&test=1&propertis="+$scope.propertis+"&takeoverid="+$scope.takeoverid)
			.success(function(response) {
				$scope.data = response.attachment;
				$scope.orderid = $scope.data.orderid;
				// 点击提交再次请求商品数据接口
				$http.post("https://api.duwu.mobi/duwu/vorder/orderInfo.json?u="+uid+"&propertis="+$scope.propertis+"&test=1")
					.success(function(response) {
						$scope.data = response.attachment;
						$scope.takeoverid = $scope.data.to[0].id;
						// 非自营商品无法购买
						if($scope.data.datas==''){
							alert('该商品无法购买');
						}
					});
				getWeiPayInfo();
			})
	    }
	};

	function getWeiPayInfo(){
		$http.get("https://api.duwu.mobi/duwu/wxpay/vpOrder.json?u="+uid+"&orderid="+$scope.orderid+"&test=1")
			.success(function(response) {
				$scope.appid = response.attachment.appid;//4个参数
				$scope.timeStamp = response.attachment.timeStamp;
				$scope.nonceStr = response.attachment.nonceStr;
				$scope.prepayid = response.attachment.prepay_id;
				$scope.sign = response.attachment.sign;
				pay();
			})
			.error(function(){
				alert("error");
			});

	}

	function onBridgeReady(){
		WeixinJSBridge.invoke(
			'getBrandWCPayRequest', {
				"appId" : $scope.appid,     //公众号名称，由商户传入
				"timeStamp": $scope.timeStamp,         //时间戳，自1970年以来的秒数
				"nonceStr" : $scope.nonceStr, //随机串
				"package" :  "prepay_id="+$scope.prepayid,
				"signType" : "MD5",         //微信签名方式
				"paySign" : $scope.sign    //微信签名
			},
			function(res){
				if(res.err_msg == "get_brand_wcpay_request:ok" ) {
					$http.post('https://api.duwu.mobi/duwu/vorder/finishPay.json?u='+uid+'&orderid='+$scope.orderid+'&test=1')
						.success(function(response) {
							if(response.status==403){
								$http.post('https://api.duwu.mobi/duwu/vorder/finishPay.json?u='+uid+'&orderid='+$scope.orderid+'&test=1')
							}else {
								alert("支付成功");
								// 跳转到我的订单页面
								window.location.href="http://www.duwu.mobi/wxduwu/home.html?_ijt=8phttqim45sltujjfqd7qrcpt5#/myorder/";
							}
						});
					//支付完成执行页面跳转
				}     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
			}
		);

	}

	function pay(){
		if (typeof WeixinJSBridge == "undefined"){
			if( document.addEventListener ){
				document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
			}else if (document.attachEvent){
				document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
				document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
			}
		}else{
			onBridgeReady();
		}
	}

	//分享到朋友圈
	shareConfig(
		'https://www.duwu.mobi/wxduwu/home.html#/index1',
		'毒物-极尽世间好物，专注提升逼格',
		'极尽世间好物,引领品质生活',
		'https://image.duwu.mobi/catfiles/37/8183/306bbe8183841.png'
	);
});
// 收货地址 qrorder.html进入
myApp.controller('shouhuoaddress', function($scope, $http, $state,$stateParams) {
	var uid = getCookie('uid');
	$scope.propertis = $stateParams.propertis;
	$http.post("https://api.duwu.mobi/duwu/vorder/orderInfo.json?u="+uid+"&propertis="+$scope.propertis+"&test=1")
		.success(function(response) {
			$scope.data = response.attachment.to;
			response.attachment.to.length ==1?defaultAdd('0',$scope.data[0].id):'';
			// 默认地址选择
			$scope.baa = $scope.data;
			$scope.bg = ['qiepic'];
			$scope.isCurrent = function(index,xid) {
				$scope.bg = [];
				$scope.bg[index] = 'qiepic';
				// 更改默认地址接口
				$http({
					url: "https://api.duwu.mobi/duwu/vto/setd.json?u="+uid+"&takeoverid="+xid+"&test=1",
					method: 'post',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8 '},
				}).success(function() {
					console.log('成功');
				}).error(function() {
					console.log('失败')
				});

			};
			// 默认地址
			function defaultAdd (index,xid) {
				$scope.bg = [];
				$scope.bg[index] = 'qiepic';
				// 更改默认地址接口
				$http({
					url: "https://api.duwu.mobi/duwu/vto/setd.json?u="+uid+"&takeoverid="+xid+"&test=1",
					method: 'post',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8 '},
				}).success(function() {
					console.log('成功');
				}).error(function() {
					console.log('失败')
				});
			}
			// 删除地址
			$scope.del = function(i,j) {
				$scope.bg = [];
				$scope.bg[0] = 'qiepic';
				$scope.baa.splice(j, 1);
				// 删除地址接口
				$http({
					url: "https://api.duwu.mobi/duwu/vto/del.json?u="+uid+"&takeoverid="+i+"&test=1",
					method: 'post',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8 '},
				}).success(function() {
					console.log('成功')
				}).error(function() {
					console.log('失败')
				});
			}
		});
	//修改地址
	$scope.go =  function (name,aid,txphone,txaddress,propertis,cityid) {
		$state.go('txaddress',{name:name,aid:aid,txphone:txphone,txaddress:txaddress,propertis:propertis,cityid:cityid})
	}

});
// 收货地址填写
myApp.controller('txaddress', function($scope, $http, $state,$stateParams) {
	var uid = getCookie('uid');
	$scope.propertis = $stateParams.propertis;
	$scope.txname = $stateParams.name;
	$scope.txphone = $stateParams.txphone;
	$scope.txaddress = $stateParams.txaddress;
	$scope.cityid = $stateParams.cityid;
	$scope.aid = $stateParams.aid;
	// 提交输入地址信息
	var area1 = new LArea();
	area1.init({
		'trigger': '#demo1', //触发选择控件的文本框，同时选择完毕后name属性输出到该位置
		'valueTo': '#value1', //选择完毕后id属性输出到该位置
		'keys': {
			id: 'cityid',
			name: 'name'
		}, //绑定数据源相关字段 id对应valueTo的value属性输出 name对应trigger的value属性输出
		'type': 1, //数据源类型
		'data': LAreaData //数据源
	});
	area1.value = [0, 1, 2]; //控制初始位置，注意：该方法并不会影响到input的value
//	var cityid = $('#value1').val();
//	console.log(cityid)
	$scope.addBtn = function(propertis) {
		$scope.name =encodeURI($scope.txname);
		$scope.phone = $scope.txphone;
		$scope.city = $('#value1').val()//no
		$scope.address =encodeURI($scope.txaddress) ;
		if($scope.aid == null){
			//调用以下方法
			beforeSubm([$scope.name,$scope.phone,$scope.city,$scope.address],'')
		}else {
			beforeSubm([$scope.name,$scope.phone,$scope.city,$scope.address],$scope.aid)
		}
		//完成之前的验证
		function beforeSubm(res,aid){
			res[0]=='null'||res[1]==null||res[2]=='null'||res[3]=='null'?alert('您填写的不完整'):regex(res[1]);
			function regex(phone){
				/^1[34578]\d{9}$/.test(phone)? goback():alert('手机号格式不正确')
			};

			function goback(){
				postAdr (aid)
			}
		}
		//点击 完成跳转
		function postAdr (aid){
			$http({
				url: 'https://api.duwu.mobi/duwu/vto/edit.json?u='+uid+'&name='+$scope.name+'&mobile='+$scope.phone+'&adress='+$scope.address+'&cityid='+$('#value1').val()+'&takeoverid='+aid+'&test=1',
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8 '},
			}).success(function() {

				$state.go('shouhuoaddress',{propertis:propertis})
			}).error(function() {
				console.log('失败')
			});
		}

	}
});
// 我的订单
myApp.controller('myorder', function($scope, $http, $state) {
	document.tittle = '我的订单';
	var uid = getCookie('uid');
	if(!uid){
		var code = getQueryString("code");// 获取微信API返回的code
		if(!code){
			uid = 0;
			setCookie('uid',uid);
		}else {
			getUserByWeiChatOpenId(code);//调用code生成的用户uid (cookie)
			uid = getCookie('uid');
		}
	}
	$scope.nav = ['全部','待付款','待收货','待评价'];
	$scope.bg = ['nav_line'];
	$scope.qieh = function(index) {
		$scope.bg = [];
		$scope.bg[index] = 'nav_line';
		var pages = 2;
		var stv = setInterval(function(){
			$scope.docuHgt = parseInt($(document).height());
			$scope.winHgt =  parseInt($(window).height());
			$scope.scrTop = parseInt($(document).scrollTop());
			if($scope.scrTop>=$scope.docuHgt-$scope.winHgt-10){
				$('.loadingBot').show();
				getMore(pages*10);
				pages++;
			}
		},500)
	   getMore('10');
	   
	function getMore(pages){	$http.get("https://api.duwu.mobi/duwu/vorder/my.json?u="+uid+"&type="+index+"&test=1&start=0&size="+pages)
			.success(function(response) {
				response.status=='400'?$scope.data='':$scope.data = response.attachment;
				$scope.data==''?$scope.total='0':$scope.total = response.attachment.total;
				pages/10==Math.ceil($scope.total/10)?$('.loadingBot').hide():$('.loadingBot').fadeOut();
				if(pages/10>Math.ceil($scope.total/10)){
					clearInterval(stv)
				}

			});
		}
	};
	$scope.qieh(0);
	// 商家服务--向功能div传递参数
	$("body,html").css({"height":"","overflow":""});
	$scope.daifh = function (phone,sid,oid,reason,totalfee,refund,ostatus) {
		$scope.phone = phone;
		$scope.sid = sid;
		$scope.oid = oid;
		$scope.reason = reason;
		$scope.totalfee = totalfee;
		$scope.refund = refund;
		$scope.ostatus = ostatus;
		$('.callshop').css('display','block');
		$("body,html").css({"height":"100%","overflow":"hidden"});
		$(".overlay").css({ "width": $(document).width(), "height":document.documentElement.clientHeight,"display":'block' });
	};
	$scope.sqth = function (phone,sid,oid,reason,totalfee,ostatus) {
		$scope.phone = phone;
		$scope.sid = sid;
		$scope.oid = oid;
		$scope.reason = reason;
		$scope.totalfee = totalfee;
		$scope.ostatus = ostatus;
		$('.callshop').css('display','block');
		$("body,html").css({"height":"100%","overflow":"hidden"});
		$(".overlay").css({ "width": $(document).width(), "height":document.documentElement.clientHeight,"display":'block' });
	};
	$scope.overlay = function() {
		$('.callshop').css('display', 'none');
		$('.overlay').css('display', 'none');
		$("body,html").css({"height":"","overflow":""});
		window.location.reload();
	};
	// 确认收货
	$scope.quePrc = function (oid) {
		$scope.oid = oid;
		$('.quePrc').css('display','block');
		$("body,html").css({"height":"100%","overflow":"hidden"});
		$(".overlay").css({ "width": $(document).width(), "height":document.documentElement.clientHeight,"display":'block' });
	};
	$scope.quePrcf = function() {
		$('.quePrc').css('display', 'none');
		$('.overlay').css('display', 'none');
		$("body,html").css({"height":"","overflow":""});
	};
	$scope.quePrcr = function(oid) {
		$http.post("https://api.duwu.mobi/duwu/vorder/sign.json?u="+uid+"&orderid="+oid+"&test=1 ")
			.success(function(response) {
			});
		$('.quePrc').css('display', 'none');
		$('.overlay').css('display', 'none');
		$("body,html").css({"height":"","overflow":""});
		window.location.reload();
	};

	// 去支付
	$scope.goPay = function (oid) {
		function getWeiPayInfo(){
			$http.get("https://api.duwu.mobi/duwu/wxpay/vpOrder.json?u="+uid+"&orderid="+oid+"&test=1")
				.success(function(response) {
					$scope.appid = response.attachment.appid;//4个参数
					$scope.timeStamp = response.attachment.timeStamp;
					$scope.nonceStr = response.attachment.nonceStr;
					$scope.prepayid = response.attachment.prepay_id;
					$scope.sign = response.attachment.sign;
					pay();
				})
				.error(function(){
					alert("error");
				});
		}

		function onBridgeReady(){
			WeixinJSBridge.invoke(
				'getBrandWCPayRequest', {
					"appId" : $scope.appid,     //公众号名称，由商户传入
					"timeStamp": $scope.timeStamp,         //时间戳，自1970年以来的秒数
					"nonceStr" : $scope.nonceStr, //随机串
					"package" :  "prepay_id="+$scope.prepayid,
					"signType" : "MD5",         //微信签名方式
					"paySign" : $scope.sign    //微信签名
				},
				function(res){
					if(res.err_msg == "get_brand_wcpay_request:ok" ) {
						$http.post('https://api.duwu.mobi/duwu/vorder/finishPay.json?u='+uid+'&orderid='+oid+'&test=1')
							.success(function(response) {
								if(response.status==403){
									$http.post('https://api.duwu.mobi/duwu/vorder/finishPay.json?u='+uid+'&orderid='+oid+'&test=1')
								}else {
									alert("支付成功");
									window.location.reload();
								}
							});
						//支付完成执行页面跳转
					}     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
				}
			);

		}

		function pay(){
			if (typeof WeixinJSBridge == "undefined"){
				if( document.addEventListener ){
					document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
				}else if (document.attachEvent){
					document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
					document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
				}
			}else{
				onBridgeReady();
			}
		}

		getWeiPayInfo()
	};

	// 跳转到给商家留言页面
	$scope.Tob =function (sid,oid) {
		$state.go('messageTob', {sid: sid,oid:oid});
	};
	// 跳转到申请退款页面
	$scope.ToRefund =function (oid,reason,prc) {
		$state.go('refund', {oid:oid,reason:reason,prc:prc});
	};
	// 跳转到申请退货页面
	$scope.ToRefund_huo =function (oid,reason,prc) {
		$state.go('refund_huo', {oid:oid,reason:reason,prc:prc});
	};
	// 跳转到去评价页面
	$scope.goComment =function (oid,obj) {
		$state.go('goComment', {oid:oid,obj:JSON.stringify(obj)});//将传递的数组转换成字符串格式进行传递.
	}

	//分享到朋友圈
	shareConfig(
		'https://www.duwu.mobi/wxduwu/home.html#/index1',
		'毒物-极尽世间好物，专注提升逼格',
		'极尽世间好物,引领品质生活',
		'https://image.duwu.mobi/catfiles/37/8183/306bbe8183841.png'
	);

});
// 给商家留言
myApp.controller('messageTob', function($scope, $http, $state,$cookieStore,$stateParams) {
	var uid = getCookie('uid');
	$scope.sid = $stateParams.sid;//跟app.js路由中的参数名要一致,不然接收不到数据.
	$scope.oid = $stateParams.oid;
	// 提交
	$scope.tiJiaoBtn = function(sid) {
		var c = $scope.txc;
		if(c==undefined){
			alert('请输入内容');
		}else {
			$http({
				url: 'https://api.duwu.mobi/duwu/vorder/orderfb.json?uid='+uid+'&storeid='+$scope.sid+'&orderid='+$scope.oid+'&c='+c+'&test=1 ',
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8 '}
			}).success(function() {
				alert('发送成功');
				history.back();
			}).error(function() {
				console.log('失败')
			});
		}

	}
});
// 申请退款
myApp.controller('refund', function($scope, $http, $state,$cookieStore,$stateParams) {
	var uid = getCookie('uid');
	$scope.prc = $stateParams.prc;//价格
	$scope.oid = $stateParams.oid;//订单id
	$scope.reason = $stateParams.reason;//原因,返回的是string类型.
	$scope.reasonA = $scope.reason.split(',');//转换成数组格式.
	$scope.selected = '';//绑定select
	$scope.tiJiaoBtn = function () {
		var c =$scope.case;//留言
		if($scope.selected==''){
			alert('请选择原因')
		}else {
			$http({
				url:"https://api.duwu.mobi/duwu/vorder/refund.json?uid="+uid+"&orderid="+$scope.oid+"&reason="+$scope.selected+"&des="+c+"&test=1",
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8 '}
			}).success(function() {
				alert('发送成功');
				history.back();
			}).error(function() {
				console.log('失败')
			});
		}
	}
});
// 申请退货
myApp.controller('refund_huo', function($scope, $http, $state,$cookieStore,$stateParams) {
	var uid = getCookie('uid');
	$scope.oid = $stateParams.oid;//订单id
	$http.get("https://api.duwu.mobi/duwu/vorder/getOrderInfos.json?u="+uid+"&orderid="+$scope.oid+"&test=1")
		.success(function(response) {
			$scope.data = response.attachment;
		});
	// 跳转到申请退原因货页面
	$scope.goTuihuo =function () {
		$state.go('goTuihuo', {oid:$scope.oid});
	};
});
// 申请退货原因
myApp.controller('goTuihuo', function($scope, $http, $state,$cookieStore,$stateParams) {
	var uid = getCookie('uid');
	$scope.oid = $stateParams.oid;//订单id
	$http.get("https://api.duwu.mobi/duwu/vorder/getOrderInfos.json?u="+uid+"&orderid="+$scope.oid+"&test=1")
		.success(function(response) {
			$scope.data = response.attachment;
		});
	// 上传图片

	var dataURL;
	var arr;
	$("#file_upload").change(function() {
		var $file = $(this);
		var fileObj = $file[0];
		var windowURL = window.URL || window.webkitURL;
		var $img = $("#preview");

		//FormData
		$scope.param = new FormData();
		$scope.param.append("hpic",fileObj.files[0]);
		$scope.param.append("u",uid);
		$scope.param.append("test",1);

		$scope.size = fileObj.files[0].size;//图片大小
		$scope.name = fileObj.files[0].name;//图片名
		arr=$scope.name.split(".");//截取图片名和后缀名


		if(fileObj && fileObj.files && fileObj.files[0]){
			dataURL = windowURL.createObjectURL(fileObj.files[0]);
			$scope.sha1 =hex_sha1(dataURL);//***sha1值算法***有引入外部js.
			$img.attr('src',dataURL);
		}else{
			dataURL = $file.val();
			var imgObj = document.getElementById("preview");
			// 两个坑:
			// 1、在设置filter属性时，元素必须已经存在在DOM树中，动态创建的Node，
			//    也需要在设置属性前加入到DOM中，先设置属性在加入，无效；
			// 2、src属性需要像下面的方式添加，上面的两种方式添加，无效；
			imgObj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale)";
			imgObj.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = dataURL;

		}
	});


	// 上传图片按钮
	$scope.updataImg = function () {
		$.ajax({
			url: 'https://api.duwu.mobi/duwu/vorder/upload.json',
			type: "POST",
			data:$scope.param,
			processData: false,
			contentType: false,
			//headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8 '}
		}).success(function(response) {
			$scope.mid = response.attachment.mid;
			if($scope.mid){
				console.log('图片上传成功')
			}
		}).error(function(response) {
			console.log('失败')
		});
	};

	// 检测报告切换选择
	$scope.info = ['已有检测报告','没有检测报告'];
	$scope.bg = ['current'];//样式的改变
	$scope.bg[1] = 'check_b';
	$scope.checkImg = function (index) {
		$scope.bg = [];
		$scope.bg[index] = 'check_b';
		$scope.report =index
	};

	$scope.txc;
	$scope.next_t = function () {
		if(!$scope.txc){
			alert('请输入问题描述')
		}else {
			$state.go('apply_huo',
				{
					oid:$scope.oid,
					report:$scope.report,
					reason:$scope.txc,
					onid:$scope.data.products[0].orderinfoid,
					pid:$scope.data.products[0].id,
					mids:$scope.mid
				});
		}

	}
});
// 申请退货原因提交
myApp.controller('apply_huo', function($scope, $http, $state,$cookieStore,$stateParams) {
	var uid = getCookie('uid');
	$scope.oid = $stateParams.oid;//订单id
	$http.get("https://api.duwu.mobi/duwu/vexc/info.json?u="+uid+"&orderid="+$scope.oid+"&test=1")
		.success(function(response) {
			$scope.data = response.attachment;
		});
	$scope.report = $stateParams.report;
	$scope.reason = $stateParams.reason;
	$scope.onid = $stateParams.onid;
	$scope.pid = $stateParams.pid;
	$scope.mids = $stateParams.mids;
	if ($scope.report==null){
		$scope.report = 1;
	}
	$scope.txname ;//填写的姓名和电话
	$scope.txphone;
	$scope.next_t = function () {
		$http({
			url: 'https://api.duwu.mobi/duwu/vexc/apply.json?u='+uid+'&orderinfoid='+$scope.onid+'&productid='+$scope.pid+'&type=1&name='+$scope.txname+'&mobile='+$scope.txphone+'&reason='+$scope.reason+'&report='+$scope.report+'&mids='+$scope.mid+'&test=1',
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8 '}
		}).success(function() {
			alert('提交成功');
			window.location.href="http://www.duwu.mobi/wxduwu/home.html?_ijt=8phttqim45sltujjfqd7qrcpt5#/myorder/";
		}).error(function() {
			console.log('失败');
		});
	}

});
// 去评价
myApp.controller('goComment', function($scope, $http, $state,$cookieStore,$stateParams) {
	var uid = getCookie('uid');
	$scope.oid = $stateParams.oid;//订单id
	$scope.products = JSON.parse($stateParams.obj);//商品信息obj对象,用JSON.parse()将其转成数组格式.
	// 星级评分
	var oStar = document.getElementById("star");
	var aLi = oStar.getElementsByTagName("li");
	var i = iScore = iStar = 0;
	for (i = 1; i <= aLi.length; i++){
		aLi[i - 1].index = i;
		aLi[i - 1].onclick = function (){
			iStar = this.index;
			fnPoint();
			$scope.istar  = iStar;
		}
	}
	//评分处理
	function fnPoint(iArg){
		//分数赋值
		iScore = iArg || iStar;
		for (i = 0; i < aLi.length; i++) aLi[i].className = i < iScore ? "on" : "";
	}
	$scope.tiJiaoBtn = function(pid,skuId) {
		var c = $scope.txc;
		var json = {'star':$scope.istar,'c':c,'productid':pid,'skuId':skuId};
		var prc = JSON.stringify(json);
		if(c==undefined){
			alert('请输入内容');
		}else {
			$http({
				url: 'https://api.duwu.mobi/duwu/vpa/add.json?u='+uid+'&orderid='+$scope.oid+'&test=1&propertis='+prc,
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8 '}
			}).success(function() {
				alert('发送成功');
				history.back();
			}).error(function() {
				console.log('失败')
			});
		}

	}



});
// 商家店铺
myApp.controller('merchantShop', function($scope, $http, $state,$cookieStore,$stateParams) {
	var uid = getCookie('uid');
	$scope.sid = $stateParams.sid;
	var pages = 2;
	var stv = setInterval(function(){	
		$scope.docuHgt = parseInt($(document).height()); 
		$scope.winHgt =  parseInt($(window).height()); 
		$scope.scrTop = parseInt($(document).scrollTop());
		if($scope.scrTop>=$scope.docuHgt-$scope.winHgt-10){
			$('.loadingBot').show();
			getMore(pages*5);
			pages++;		
		}	
	},500)
   getMore('5');
	function getMore(pages) {
		$http.get("https://api.duwu.mobi/duwu/vp/storeHome.json?u="+uid+"&storeid="+$scope.sid+"&start=0&size="+pages+"&test=1")
		.success(function(response) {
			$scope.data = response.attachment;
			$scope.total = response.attachment.total;	
			pages/5==Math.ceil($scope.total/5)?$('.loadingBot').hide():$('.loadingBot').fadeOut();
			if(pages/5>Math.ceil($scope.total/5)){
				clearInterval(stv)
			}
		})
	}
});
//订阅列表
myApp.controller('Subscribe',function ($scope, $http, $state,$stateParams) {
	var uid = getCookie('uid')
	$http.get('http://api.duwu.mobi/duwu/vp/themePage.json?u='+uid+'&themeid=1467956315183&test=1')
		.success(function (response) {
			$scope.data = response.attachment;
			console.log($scope.data.ts)
		})
});
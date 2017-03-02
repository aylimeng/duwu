// 我的购物车
myApp.controller('mycart', function($scope, $http, $state,$cookieStore) {
	document.title = '我的购物车';
	var uid = $cookieStore.get("uid");
	// if(uid==0){
	// 	var cUrl = window.location.href;
	// 	var a = 123;
	// 	weiChatLogin(cUrl,a);
	// 	var code = getQueryString("code");// 获取微信API返回的code
	// 	getUserByWeiChatOpenId(code);//调用code生成的用户uid (cookie)
	// 	uid = getCookie('uid');
	// }
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

	$scope.propertis = [];
		$http.get("https://api.duwu.mobi/duwu/vbc/myBuyCar.json?u="+uid+"&start=0&size=5&test=1")
			.success(function (response) {
				$scope.data = response.attachment;
				console.log($scope.data)
		});
		function renderAllSelected (){
				var isSe = true;
				for(var i=0;i<$scope.data.datas.length;i++){
					for(var j=0;j<$scope.data.datas[i].products.length;j++){
						// console.log('i:'+i+',j:'+j+'break,'+!$scope.data.datas[i].products[j].isCh);
						if(!$scope.data.datas[i].products[j].isCh){
							isSe = false;
							return;
						}
					}
				}
				$scope.all = isSe;
			}

			function renderCheckbox(isSe){
				for(var i=0;i<$scope.data.datas.length;i++){
					for(var j=0;j<$scope.data.datas[i].products.length;j++){
						// console.log($scope.data.datas[i].products[j].buyCarId);
						$scope.data.datas[i].products[j].isCh = isSe;
					}
				}
			}

			$scope.totalPrice=0;
			$scope.selectShopPro = function(id,isCh,price,x,i){
				// console.log(id+":"+isCh+":"+price);
				if(id=='all'){
					//全选按钮点击
					if(isCh){
						var total = 0;
						angular.forEach($scope.data.datas,function(d){
							angular.forEach(d.products,function(d){
								total +=parseFloat(d.price*d.pnum);
							});
						});
						$scope.totalPrice = total;
						addAllPro(i);//传递全选商品数据
						// addPro(x);
					}else{
						$scope.totalPrice = 0;
						$scope.propertis=[]
					}
					renderCheckbox(isCh);
				}else{//商品选择按钮点击
					if(isCh){//选中商品
						$scope.totalPrice+=parseFloat(price);
						renderAllSelected();
						addPro(x);//向数组中添加选中的商品信息
					}else{//取消选中
						if($scope.totalPrice>=price){
							$scope.totalPrice-=parseFloat(price);
						}else{
							console.log('error!');
						}
						$scope.all && ($scope.all = false);
						delPro(x);//从数组中删除取消选中的商品信息
					}
				}
			};

			// 单选向数组中增加商品信息
			function addPro(x){
				// console.log(x);
				var proObj ={};
				proObj.storeId = x.storeId;
				proObj.postscript='';
				proObj.products = [];
				var objPro = {};
				objPro.skuId = x.skuId;
				objPro.pnum = x.pnum;
				proObj.products.push(objPro);
				// console.log(proObj);
				$scope.propertis.push(proObj);
				// console.log($scope.propertis);
				return $scope.propertis
			}
			// 单选向数组中减掉商品信息
			function delPro(x){
				$scope.propertis.splice($scope.propertis.indexOf(x));
				// console.log($scope.propertis);
				return $scope.propertis
			}
			// 全选向数组中增加全部商品信息
			function addAllPro(){
				var obj = $scope.data.datas;
				angular.forEach(obj,function(d){
					angular.forEach(d.products,function(i){
						var proObj ={};
						proObj.storeId = i.storeId;
						proObj.postscript='';
						proObj.products = [];
						var objPro = {};
						objPro.skuId = i.skuId;
						objPro.pnum = i.pnum;
						proObj.products.push(objPro);
						$scope.propertis.push(proObj);
					});
				});
			}

			// 数量增加减少改变价格(该功能暂时没有,但不要删除)
			// $scope.onePrice = function (id,d) {
			// 	angular.forEach($scope.data.datas,function(d){
			// 		angular.forEach(d.products,function(d){
			// 			if(id==d.buyCarId){
			// 				d.pnum=d.pnum+1;
			// 				$scope.oneAllPrice=d.pnum*d.price;
			// 				console.log(id+":"+d.pnum+":"+$scope.oneAllPrice)
			// 			}
            //
			// 		});
			// 	})
			// }

				// 删除接口
			$scope.cartDelete = function (d,index) {
				$http.post("https://api.duwu.mobi/duwu/vbc/del.json?u="+uid+"&ids="+d+"&test=1")
				.success(function(response) {
					alert('该商品已删除');
					window.location.reload();
					});
				};

			$scope.tijiao = function (totalPrice,propertis) {
				if(totalPrice==0){
					alert('请先选中商品!');
				}else {
					// console.log($scope.propertis)
					propertis = JSON.stringify($scope.propertis);
					// console.log(propertis)
					$state.go('qrorder', {propertis: propertis});
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

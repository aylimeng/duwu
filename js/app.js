
var myApp = angular.module('myApp', ['ui.router','ngCookies']);
myApp.config(function($stateProvider, $urlRouterProvider,$locationProvider) {
    $urlRouterProvider.otherwise('/index1');
    // $locationProvider.html5Mode(true);
    $stateProvider
    // 首页
        .state("index1", {
            url: "/index1",
            views: {
                'main': {
                    templateUrl: 'tpls/index1.html',
                    controller: 'dongtai'
                }
            }
        })

        // 推荐详情页面
        .state('tui_recommend', {
            url: '/tui_recommend?id',
            views: {
                'main': {
                    templateUrl: 'tpls/tui_recommend.html',
                    controller:'xiangqing'
                }
            }
        })

        // 商品详情页面
        .state('shangpin', {
            url: '/shangpin?u&pid',
            views: {
                'main': {
                    templateUrl: 'tpls/shangpin.html',
                    controller: 'shangpin'
                }
            }
        })

        // 确认订单页面
        .state('qrorder', {
            url: '/qrorder/?propertis',
            views: {
                'main': {
                    templateUrl: 'tpls/qrorder.html',
                    controller: 'qrorder'
                }
            }
        })

        // 收货地址 qrorder.html进入
        .state('shouhuoaddress', {
            url: '/shouhuoaddress?propertis',
            views: {
                'main': {
                    templateUrl: 'tpls/shouhuoaddress.html',
                    controller: 'shouhuoaddress'
                }
            }
        })

        // 收货地址 shouhuoaddress.html进入
        .state('txaddress', {
            url: '/txaddress?name&aid&txaddress&txphone&propertis&cityid',
            views: {
                'main': {
                    templateUrl: 'tpls/txaddress.html',
                    controller: 'txaddress'
                }
            }
        })

        // 我的订单
        .state('myorder', {
            url: '/myorder/?uid',
            views: {
                'main': {
                    templateUrl: 'tpls/myorder.html',
                    controller: 'myorder'
                }
            }
        })

        // 我的购物车
        .state('mycart', {
            url: '/mycart/?uid',
            views: {
                'main': {
                    templateUrl: 'tpls/mycart.html',
                    controller: 'mycart'
                }
            }
        })

        // 商家店铺
        .state('merchantShop', {
            url: '/merchantShop/?sid',
            views: {
                'main': {
                    templateUrl: 'tpls/MerchantShop.html',
                    controller: 'merchantShop'
                }
            }
        })

        // 给商家留言
        .state('messageTob', {
            url: '/messageTob/?sid&oid',
            views: {
                'main': {
                    templateUrl: 'tpls/messageTob.html',
                    controller: 'messageTob'
                }
            }
        })
        //申请退款
        .state('refund', {
            url: '/refund/?oid&reason&prc',
            views: {
                'main': {
                    templateUrl: 'tpls/refund.html',
                    controller: 'refund'
                }
            }
        })
        //申请退货
        .state('refund_huo', {
            url: '/refund_huo/?oid&reason&prc',
            views: {
                'main': {
                    templateUrl: 'tpls/refund_huo.html',
                    controller: 'refund_huo'
                }
            }
        })
        //申请退货原因
        .state('goTuihuo', {
            url: '/goTuihuo/?oid',
            views: {
                'main': {
                    templateUrl: 'tpls/goTuihuo.html',
                    controller: 'goTuihuo'
                }
            }
        })
        //申请退货提交
        .state('apply_huo', {
            url: '/apply_huo/?oid&report&reason&onid&pid',
            views: {
                'main': {
                    templateUrl: 'tpls/apply_huo.html',
                    controller: 'apply_huo'
                }
            }
        })
        //去评价
        .state('goComment', {
            url: '/goComment/?oid&obj',
            views: {
                'main': {
                    templateUrl: 'tpls/goComment.html',
                    controller: 'goComment'
                }
            }
        })

        //订阅列表
        .state('Subscribe', {
            url: '/Subscribe/',
            views: {
                'main': {
                    templateUrl: 'tpls/Subscribe.html',
                    controller: 'Subscribe'
                }
            }
        })
});


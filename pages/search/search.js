const AV = require('leancloud-storage/core');
const adapters = require('@leancloud/platform-adapters-baidu');
const { ok } = require('assert');
const { title } = require('process');
AV.setAdapters(adapters);
var APP_ID = "你的APP_ID";//请去leancloud自己注册账号并填入APP_ID
var APP_KEY = "你的APP_KEY";//请去leancloud自己注册账号并填入APP_KEY
var serverURL = "你的域名";//请去leancloud自己注册账号并填入serverURL
AV.init({
    appId: APP_ID,
    appKey: APP_KEY,
    serverURL: serverURL
})
Page({
    data: {
        //系统相关
        loadQuerySucess:true,
        screenWidth:'320rpx',//默认机型宽
        screenHeight:'568rpx',//默认机型高
        StatusBar:0,
        CustomBar:0,
        //输入框相关
        inputText:'',//输入框内的内容
        placeholder:'输入搜索内容...',//搜索提示词
        select:false,//是否展开下拉框
        arrow:'../../images/down.svg',//下拉框的图标
        selectTitle:'人数',//限制的人数（将gamesQuery减少成为该人数内的游戏列表）
        show:[true,true,true,true,false],
        //游戏相关
        gameId:'4',
        gamesList:[],//当前需要显示的游戏列表
        gamesQuery:[],//所有的游戏的列表
        gameInfo:[],//当前游戏的所有信息
        isSearchResult:false,//决定当前游戏列表是否显示单个卡牌
        //卡牌相关
        num:[],//卡牌当前显示的界面
        isClickResult:false,//判断堆叠时卡牌是否被点击
        isLastLoad:false,//判断卡牌是否已经加载到最后一个
        cardHeight:'200px',//卡牌初始高度
    },
    onLoad: function (options) {
        // 监听页面加载的生命周期函数
        this.setData({
              gameId: options.gameId
            });
        const result = swan.getSystemInfoSync();
        if (!(result instanceof Error)) {
        //获取用户设备信息，并登记
            this.setData({
                screenHeight:result.screenHeight,
                screenWidth:result.screenWidth,
                cardHeight:result.screenHeight*0.8,
                StatusBar: result.statusBarHeight,
                CustomBar:result.navigationBarHeight,
            });
        //console.log('getSystemInfoSync success', result);
        }
        else {
            console.log('getSystemInfoSync fail', result.message);
        }

        console.log("当前在search页面");
        // 从数据库获取所有游戏列表
        let that = this;
        that.LoadingMethod();
    },
    onReady: function() {
        // 监听页面初次渲染完成的生命周期函数
    },
    onShow: function() {
        // 监听页面显示的生命周期函数
    },
    onHide: function() {
        // 监听页面隐藏的生命周期函数
    },
    onUnload: function() {
        // 监听页面卸载的生命周期函数
    },
    onPullDownRefresh: function() {
        // 监听用户下拉动作
    },
    onReachBottom: function() {
        // 页面上拉触底事件的处理函数
    },
    onShareAppMessage: function () {
        // 用户点击右上角转发
    },
    LoadingMethod:function(){
        let that=this;
        console.log("正在加载……");
        that.setData({
            isLastLoad:false,
            loadQuerySucess:true,
        });
        let query = new AV.Query("Counter");
        query.equalTo("gameId",that.data.gameId);
        console.log('正在浏览gameId为',that.data.gameId,'的详情页');
        query.find().then((todos)=>{
            if(todos.length<=0){
                that.setData({
                    loadQuerySucess:false,
                });
            }
            todos.some((todo)=>{
                var defaultNum='num['+todo.attributes.gameId+']';
                todo.attributes.tags=todo.attributes.keyword.split('/');
                that.setData({
                    gamesList:[].concat(that.data.gamesList,todo.attributes),
                    [defaultNum]:1,
                });
            });
            that.setData({
                loadQuerySucess:true,
                gamesQuery:that.data.gamesList
            });
        }).catch(()=>{
            swan.showToast({
                title: "请检查你的网络连接~显示不出来呦",
                icon: 'none',
                duration: 1000
            });
            that.setData({
                loadQuerySucess:false,
                gamesList:that.data.gamesQuery//恢复原来的游戏列表
            });
            console.log("请求游戏列表失败，检查网络");
        })
    },
    changeNum: function (e) {
        var changeNum='num['+e.currentTarget.dataset.gameId+']';
        this.setData({
            [changeNum]: [e.currentTarget.dataset.num]
        });
    },
    returnSearch(){
        let that=this;
        that.setData({
            isClickResult:false,
            isSearchResult:false,
            gamesList:[],
        });
        that.LoadingMethod();
    },
    returnTop:function(){
        console.log("回到顶部");
        swan.pageScrollTo({
            scrollTop:0,
            duration:200
        });
    },
    toFeedBack:function(){
        swan.navigateTo({
            url:'/feedback',
    })
    },
});
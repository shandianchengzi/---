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
const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: swan.canIUse('button.open-type.getUserInfo'),
        //输入框相关
        inputText:'',//输入框内的内容
        placeholder:'来搜搜想玩的游戏~',//搜索提示词
        select:false,//是否展开下拉框
        arrow:'../../images/down.svg',//下拉框的图标
        selectTitle:'人数',//限制的人数（将gamesQuery减少成为该人数内的游戏列表）
        show:[true,true,true,true,false],
        isInputFocus:false,
        //搜索推荐相关
        namesList:[],
        tagsList:[],
        windowHeight:"1080rpx",
        //游戏相关
        gamesList:[],//当前需要显示的游戏列表
        gamesQuery:[],//所有的游戏的列表
        gameInfo:[],//当前游戏的所有信息
        isSearchResult:false,//决定当前游戏列表是否显示单个卡牌
        loadQuerySucess:true,
        //卡牌相关
        num:[],//卡牌当前显示的界面
        isClickResult:false,//判断堆叠时卡牌是否被点击
        isLastLoad:false,//判断卡牌是否已经加载到最后一个
    },
    onLoad() {
        // 监听页面加载的生命周期函数
        // 从数据库获取所有游戏列表
        let that = this;
        that.LoadingMethod();
    },
    onReachBottom:function(){
        let that=this;
        console.log("滑到底部，加载更多");
        if(!that.data.isLastLoad)
            that.LoadingMethod();
    },
    noThing:function(){
        console.log("noThing happened.");
    },
    getUserInfo(e) {
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        });
    },
    LoadingMethod:function(){
        let that=this;
        console.log("正在加载……");
        that.setData({
            isLastLoad:false,
            loadQuerySucess:true,
        });
        let query = new AV.Query("Counter");
        let maxLoadLen=10;
        if(!that.data.isSearchResult){
            query.limit(maxLoadLen+1);
            query.skip(that.data.gamesList.length);//跳过已经读入的前n项
        }
        if(that.data.selectTitle!="人数"){
            query.equalTo("numForUse",that.data.selectTitle);
            console.log('这是一个限制人数的搜索');
        }
        if(that.data.isSearchResult){//如果是加载搜索结果，则全部显示(因为skip方法不能用在and里面，有bug)
            console.log("加载搜索结果");
            const titleMatchQuery=new AV.Query("Counter");
            titleMatchQuery.contains("title",that.data.inputText)
            const keywordMatchQuery=new AV.Query("Counter");
            keywordMatchQuery.contains("keyword",that.data.inputText);
            query=AV.Query.and(query,AV.Query.or(titleMatchQuery,keywordMatchQuery));
        }
        query.find().then((todos)=>{
            if(todos.length<=maxLoadLen){
                that.setData({
                    isLastLoad:true,
                });
                console.log("当前卡牌已加载到最后一个");
            }
            let tempi=0;
            todos.some((todo)=>{
                tempi=tempi+1;
                if(!that.data.isSearchResult){
                if(tempi>maxLoadLen)return true;}
                var defaultNum='num['+todo.attributes.gameId+']';
                todo.attributes.tags=todo.attributes.keyword.split('/');
                that.setData({
                    gamesList:[].concat(that.data.gamesList,todo.attributes),
                    [defaultNum]:1,
                });
            });
            //console.log(that.data.gamesList);
            that.setData({
                loadQuerySucess:true,
                gamesQuery:that.data.gamesList
            });
        }).catch(()=>{
            swan.showToast({
                title: "请检查你的网络连接~显示不出来呦",
                icon: 'none',
                duration: 1500
            });
            that.setData({
                loadQuerySucess:false,
                gamesList:that.data.gamesQuery//恢复原来的游戏列表
            });
            console.log("请求游戏列表失败，检查网络");
        })
    },
    //top区相关函数
    searchInput: function (e) {
        // 处理输入框的值
        this.setData({
            inputText: e.detail.value
        });
        // 当删除input的值为空时
        if (e.detail.value == "") {
            this.setData({
                placeholder:"输入搜索内容..."
            });
        }
    },
    search: function () {
        // 搜索函数
        let that=this;
        if (that.data.inputText != "") {
            that.setData({
                gamesList:[],//将当前显示的游戏列表清零
                isSearchResult:true
            });
            that.LoadingMethod();
            that.setData({
                inputText:''
            });
        } else {
            swan.showToast({
                title: "输入不能为空喔！~",
                icon: 'none',
                duration: 1500
            });
        }
    },
    showDownBox() {
        this.setData({
            select: !this.data.select,
            arrow: this.data.select ? '../../images/down.svg' : '../../images/up.svg'
        });
    },
    numLimit(e) {
        let that=this;
        var name = e.currentTarget.dataset.name;
        let tempi=0;
        while(tempi!=5){
            if(tempi!=e.currentTarget.dataset.id)
                that.data.show[tempi]=true;
            else
                that.data.show[tempi]=false;
            tempi=tempi+1;
            //console.log(tempi,that.data.show[tempi]);
            }
        that.setData({
            show:that.data.show,
            selectTitle: name,
            select: false,//隐藏下拉框
            gamesList:[],//当前显示的游戏列表置空
        });
        console.log(that.data.show);
        that.LoadingMethod();
    },
    inputFocus:function(){
        let that=this;
        that.setData({
            isInputFocus:true,
        })
        if(!that.data.namesList.length&&!that.data.tagsList.length){
        that.setData({
            namesList:[],
            tagsList:[],
        });
        let query = new AV.Query("Recommender");
        query.find().then((todos)=>{
            todos.some((todo)=>{
                if(todo.attributes.type=="name"){
                that.setData({
                    namesList:[].concat(that.data.namesList,todo.attributes),
                });}
                else if(todo.attributes.type=="tag"){
                    that.setData({
                        tagsList:[].concat(that.data.tagsList,todo.attributes),
                    });
                }
            });
        }).catch(()=>{
            swan.showToast({
                title: "请检查你的网络连接~显示不出来呦",
                icon: 'none',
                duration: 1500
            });
        })
    }
    },
    inputNotFocus:function(){
        let that=this;
        that.setData({
            isInputFocus:false,
        })
    },
    go_search:function(e){
        let that =this;
        let content=e.currentTarget.dataset.content;
        that.setData({
            inputText:content
        });
        that.search();
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
    go_ToSearchResult:function(e){
        let url="/search?gameId="+e.currentTarget.dataset.gameId+"";
        console.log(url);
        swan.navigateTo({
            url:url,
    })
    },
})

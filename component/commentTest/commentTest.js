import * as LC from '../../lib/lc.min';
const AV = require('leancloud-storage/core');
const adapters = require('@leancloud/platform-adapters-baidu');
AV.setAdapters(adapters);
var APP_ID= "778bavqgEhXQlDlCyR5JrC50-gzGzoHsz";
var APP_KEY = "O3ct9bIuB4HJoS9pIqVGPvdh";
AV.init({
  appId: APP_ID,
  appKey: APP_KEY,
  serverURL:"https://778bavqg.lc-cn-n1-shared.com"
})
function checkTime(s) {
  return s < 10 ? '0' + s : s;
}
function getLocalDateTimeStr(input) {
  let d = new Date(input);
  let res_date = d.getFullYear() + '-' + checkTime(d.getMonth() + 1) + '-' + checkTime(d.getDate());
  let res_time = checkTime(d.getHours()) + ':' + checkTime(d.getMinutes()) + ':' + checkTime(d.getSeconds());
  return res_date + ' ' + res_time;
}
Component({
    properties: {
        propName: { // 组件的可选属性
            properties: {
                gameTitle: {
                  type: String,
                  value: ''
                },
                theme: {
                  type: String,
                  value: 'light' // light & dark
                },
                contentMinLen: {
                  // 评论内容至少为多长限制
                  type: Number,
                  value: 2
                },
                contentMaxLen: {
                  type: Number,
                  value: 150
                },
                gameID: {
                  type: String,
                  value: '',
                },
                swanIdForSystem: {
                  type: String,
                  value: "123445"
                }
              },
        }
    },

    data: {
        // 主题
        isDark: false,
        // 系统相关
        showAurButton: false,
        isMenuboxShow: false,
        isMenuboxLoad: true,
        enableComment: false,
        menuBackgroup: false,
        isLoginPopup: false,
        model:'',
        system:'',
        language:'',
        version:'',
        // 评论相关
        commentTabName: 'Comment',
        counterTabName: 'Counter',
        placeholder: '评论...',
        display: 'block',
        commentPNum: 0,
        scoreForUse:"5.0",
        randomData:1,//随机头像
        randomAvatar:"https://gitee.com/shandianchengzi/picture-bed/raw/master/img/1.png",
        commentIndex: 1,
        isLastLoad: false,
        isLoadSucess: true,
        isFocusing: false,
        commentsRawList: [],
        commentsList: [],
        content: '',
        commentLen:0
      },
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    lifetimes: {
        created: function () {

          // 组件实例刚刚被创建时,加载评论列表
          console.log("Comment-component-created");
          try {
            //获取用户设备信息，并登记
            const result = swan.getSystemInfoSync();
            this.setData({
                'model': result.model,
                'system':result.system,
                'language':result.language,
                'version':result.version
            });
            //console.log('getSystemInfoSync success', result);
        } catch (e) {
            console.log('getSystemInfoSync fail', e);
        };
          //获取对应gameid的评论列表
          this.LoadingMethod();
          //获取随机数
          let str="https://gitee.com/shandianchengzi/picture-bed/raw/master/img/";
          let ran=Math.floor(Math.random()*10)+1;
          console.log("当前头像为第",ran,'个');
          this.setData({randomAvatar:str+ran+".png"});
      },
      LoadingMethod:function(){
        let that=this;
        console.log("正在加载……");
        that.setData({
            isLastLoad:false,
            isLoadSucess:true,
        });
        let query = new AV.Query("Comment").ascending('createdAt');;
        query.find().then((todos)=>{that.setData({commentLen:todos.length});})
        let maxLoadLen=10;
        query.limit(maxLoadLen+1);
        query.skip(that.data.commentsList.length);//跳过已经读入的前n项
        query.equalTo("gameid",that.data.gameID);
        query.find().then((todos)=>{
            if(todos.length<=maxLoadLen){
                that.setData({
                    isLastLoad:true,
                });
                console.log("当前评论已加载到最后一个");
            }
            let tempi=0;
            todos.some((todo)=>{
                tempi=tempi+1;
                //console.log(todo);
                if(!that.data.isSearchResult){
                if(tempi>maxLoadLen)return true;}
                todo.attributes.createdAt=getLocalDateTimeStr(todo.createdAt);
                that.setData({
                    commentsList:[].concat(that.data.commentsList,todo.attributes),
                });
                //console.log(that.data.commentsList);
            });
            that.setData({
                isLoadSucess:true,
            });
            swan.showToast({
              title: "评论加载成功",
              icon: 'none',
              duration: 500
          });
        }).catch(()=>{
            swan.showToast({
                title: "请检查你的网络连接~显示不出来呦",
                icon: 'none',
                duration: 2000
            });
            that.setData({
                isLoadSucess:false,
            });
            console.log("请求评论列表失败，检查网络");
        })
    },
        attached: function () {
          this.getUAInfo();
        },
        ready: function () {// 在组件在视图层布局完成后执行
          //console.log("ready");
        },
        detached: function () {// 在组件实例被从页面节点树移除时执行
          //console.log("detached");
        }
      },
      methods: {
        inputStart:function(){
            this.setData({
                enableComment:true
            })

        },
        onReplyFocus: function (e) {
          console.log('onReplyFocus');
        },
        onReplyBlur: function (e) {
          let that = this;
          console.log('onReplyBlur');
          that.data.isFocusing = false;
          this.setData({
            enableComment:false
        })
          const text = e.detail.value.trim();
          if (text === '') {
            that._resetInput();
          }
        },
      writeComment: async function test(content) {
        let that=this;
        const acl = new LC.ACL();
        const acl2 = new LC.ACL();
        acl.allow('*', 'read');
        acl.allow("*", 'write');
        let tree_data={
          nick:'default',
          avatar:that.data.randomAvatar,
          ua:that.data.uaInfo,
          gameid:that.data.gameID,
          comment: `${content}`,
          gameTitle:that.data.gameTitle,
          score:that.data.scoreForUse,
          ACL: acl,
      };
      let todo;
      const query = LC.CLASS('Counter').where('title', '==', that.data.gameTitle);
        try{
          todo = await LC.CLASS('Comment').add(tree_data);
          const todos = await query.find();
          todos[0].data.score=String((parseFloat(todos[0].data.score)*parseFloat(todos[0].data.scoreNum)+parseFloat(that.data.scoreForUse))/(parseFloat(todos[0].data.scoreNum)+1));
          todos[0].data.scoreNum=String(parseInt(todos[0].data.scoreNum)+1);
          swan.showToast({
            title: '发表成功！不过评分功能尚在完善中……',
            icon: 'none',
            duration: 1500
          });
          console.log('当前评论的游戏是：' + that.data.gameTitle);
          console.log('发布成功,发布的评论的objectId为',todo.id);
          tree_data.createdAt=getLocalDateTimeStr(todo.createdAt);
          that.setData({
            isLoadSucess:true,
            commentsList:[].concat(tree_data, that.data.commentsList),
            commentLen:that.data.commentLen+1,
          });
          that.setData({
            commentsRawList:that.data.commentsList
          });
          that.setData({
            commentsList:[]
          });
          that.setData({
            commentsList:that.data.commentsRawList
          });
          console.log(that.data.commentsList);
        }catch(ex){
          swan.showToast({
            title: '评论发生错误...',
            icon: 'none',
            duration: 1500
          });
          console.log(ex.code);
          console.log(ex.error);
        }
      },
      // 提交评论
      bindFormSubmit: function (e) {
        let that = this; // 判断内容长度是否满足最小要求
        let content = e.detail.value.inputComment;
        if (content.length <= that.data.contentMinLen) {
          swan.showToast({
            title: '评论内容长度不够^_^',
            icon: 'none',
            duration: 2000
          });
          return;
        } //写入评论
        that.writeComment(content);
        that._resetInput();
      },
      getUAInfo: function () {
        let that = this;
            that.data.uaInfo = "model:" + that.data.model + ";system:" + that.data.system + ";language:" + that.data.language + ";version:" + that.data.version;
            //console.log(that.data.uaInfo);
      },
      _resetInput: function () {
        let that = this;
        that.setData({
          placeholder: "评论...",
          content: '',
        });
      },
      scoring: function(e) {
        let that=this;
          that.setData({
            scoreForUse: String(e.detail.fraction)+".0"
          })
      },
    } // end of method
});
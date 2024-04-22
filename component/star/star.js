Component({
    properties: {
        gameScore: {
            type: String,
            value: '5.0'
          },
          isText: {
            type: Boolean,
            value: true
          },
    },

    data: {
        score_true:"5.0",
        score_width:"40rpx"
    }, // 私有数据，可用于模版渲染
    lifetimes: {
        
        ready: function () {// 在组件在视图层布局完成后执行
            this.load();
        },
        load:function(){
            let that=this;
            //console.log("star-component-ready");
            that.setData({
                score_true:that.data.gameScore
            });
            //console.log(that.data.gameScore);
            var width=String(89.0*parseFloat(that.data.score_true)/5)+"rpx";
            that.setData({
                score_width:width
            });
            //console.log(that.data);
        }
      },

    methods: {
        onTap: function () {
            
        }
    }
});
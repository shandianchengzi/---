Component({
    properties: {
        propName: { // 属性名
            isScore:{
                type: Boolean,
                value: true,
            },
            scores: {
                type: Number,
                value: 5, // 属性初始值（必填）
            }
        }
    },

    data: {
        list: [
            '../../images/gray-star.svg',
            '../../images/gray-star.svg',
            '../../images/gray-star.svg',
            '../../images/gray-star.svg',
            '../../images/gray-star.svg',
        ],
        number: 5
    }, // 私有数据，可用于模版渲染

    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名


    attached: function () {},

    detached: function () {},

    methods: {
        show:function(e){
            console.log('chufa')
            let number = e.target.dataset.number;
            let list = [
                '../../images/gray-star.svg',
                '../../images/gray-star.svg',
                '../../images/gray-star.svg',
                '../../images/gray-star.svg',
                '../../images/gray-star.svg',
            ]
            for (let i = 0; i <= number; i++) {
                list[i] = '../../images/fill-star.svg'
            }
            this.setData({
                list,
                number: idx + 1
            })
            this.triggerEvent('show', {
                fraction: this.data.number
            })

        },
        scoring: function (e) {

            let idx = e.target.dataset.index
            let list = [
                '../../images/gray-star.svg',
                '../../images/gray-star.svg',
                '../../images/gray-star.svg',
                '../../images/gray-star.svg',
                '../../images/gray-star.svg',
            ]
            for (let i = 0; i <= idx; i++) {
                list[i] = '../../images/fill-star.svg'
            }
            this.setData({
                list,
                number: idx + 1
            })
            this.triggerEvent('scoring', {
                fraction: this.data.number
            })
        }

    }
});
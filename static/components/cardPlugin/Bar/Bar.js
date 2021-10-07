import Util from '@/module/common/Util'
const util = new Util()
define(['./Bar.class', '../../../lib/configBase/commonMethod'], function(Bar, commonMethod) {
    //'./config/config'
    const defaultOption = {
        type: 'bar',
        name: window.lanto.$i18n('static_components_cardPlugin_Bar_Bar_js_1'),
        options: { xAxis: {}, yAxis: { type: 'category' }, series: [{ type: 'bar' }] },
        analysis: ['constant-line', 'average-line', 'max-line', 'min-line']
    }
    // const util = new lanto.modules.common_Util()
    var _ = util._
    var $ = util.$
    var component = {
        name: 'bar',
        components: {},
        mixins: [commonMethod.commonMethod],
        data() {
            return {}
        },
        mounted() {
            this.chart = new Bar(defaultOption)
            // this.chart.load(this.config.option, $(this.$el))
        },
        watch: {
            'config.filter': {
                handler: function(n, o) {
                    // console.log('filterChange=====:', n)
                },
                deep: true
            }
        },
        props: {
            config: {
                type: Object,
                default() {
                    return { option: {}, width: '100%', height: '100%' }
                }
            }
        },
        methods: {
            // getData() {
            //     var chartOption = this.$refs.chartIns.getOptions()
            //     var data = Object.assign({}, chartOption)
            //     data.dataset = null
            //     delete data.dataset
            //     return data
            // },
            // setOptions(options) {
            //     this.chart.load(options, $(this.$el))
            // },
            // getOptions() {
            //     return this.chart.getOption()
            // },
            // setDataSource(data, card, type) {
            //     this.chart.setDataSource(...arguments)
            // },
            // setStyle(options) {
            //     this.chart.setStyle(options)
            // },
            // markLine(analysis, data) {
            //     this.chart.markLine(analysis, data)
            // },
            // setMarkLineStyle(id, opt) {
            //     this.chart.setMarkLineStyle(id, opt)
            // },
            // delMarkLine(id) {
            //     this.chart.delMarkLine(id)
            // },
            // resize() {
            //     this.chart.resize()
            // }
        },
        template: `<div :style="{width: config.width+'px', height: config.height+'px'}"></div>`
    }
    // render(h) {}
    return { component: component } //, config: new config()
})

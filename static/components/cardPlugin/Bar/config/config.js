define(['../../../../lib/configBase/ConfigBase'], function(ConfigBase) {
    return ConfigBase.extend({
        init: function() {
            this._super()
            this.name = window.lanto.$i18n('static_components_cardPlugin_Bar_config_config_js_12')
            this.type = 'bar'
            this.group = 'card'
            this.serieType = 'axis'
            this.rules = [
                {
                    dimension: {
                        count: 1,
                        operator: 'eq',
                        best: { type: ['3', '4'], operator: 'notContain', axis: 'y' }
                    },
                    measure: { count: 1, operator: 'eq' }
                }
            ]
            this.mergeConfig = {
                commonConfig: [].concat([], this.chartsAxisConfig, this.legendConfig),
                seriesConfig: [].concat(
                    [
                        // 类型
                        {
                            fieldId: 'series[@].type',
                            label: window.lanto.$i18n(
                                'src_components_home_business_card_editorsContainer_editorsContainer_vue_30'
                            ),
                            value: 'bar',
                            type: 'select',
                            options: [
                                // 柱状
                                {
                                    value: 'bar',
                                    label: window.lanto.$i18n(
                                        'src_components_home_business_card_editorsContainer_editorsContainer_vue_25'
                                    )
                                },
                                {
                                    value: 'line',
                                    label: window.lanto.$i18n(
                                        'src_components_home_business_card_editorsContainer_editorsContainer_vue_24'
                                    )
                                },
                                {
                                    value: 'scatter',
                                    label: window.lanto.$i18n(
                                        'src_components_home_business_card_editorsContainer_editorsContainer_vue_27'
                                    )
                                },
                                {
                                    value: 'area',
                                    label: window.lanto.$i18n(
                                        'src_components_home_business_card_editorsContainer_editorsContainer_vue_28'
                                    )
                                }
                            ]
                        }
                    ],
                    this.commonSeriesConfig,
                    this.xySeriesConfig,
                    this.labelSeriesConfig
                )
            }
        },
        weight() {
            //推荐权重
            let [initWeight, wd] = [0, this.countWD()] //初始化权重 为0 不推荐 , 获取维度度量个数
            let w = wd.dimension
            let d = wd.measure
            if (w.length && d.length && w.length <= 1) {
                initWeight++
                if (w.axis === 'y' && d.length === 1) {
                    initWeight++
                }
            }
            return initWeight
        },
        weigthDescription: '纵轴1个维度,横轴1个或多个度量',
        analysis(card) {
            //高级分析
            let forecastAr = ['exp1-line', 'exp2-line', 'exp3-line', 'linear-line', 'warning', 'trend-line']
            let baseAr = ['constant-line', 'average-line', 'max-line', 'min-line']
            let analysisAr = []

            if (card && card.player.length > 0) {
                analysisAr = baseAr
            } else if (card && card.legend.length && card.legend[0].dataType === 'dimension') {
                //add by wt-sf2069 维度做图例的时候，不支持画线
                analysisAr = []
            } else {
                analysisAr = baseAr.concat(forecastAr)
            }
            // let analysisAr = card && card.player.length > 0 ? baseAr : baseAr.concat(forecastAr)
            return analysisAr
        },
        //isMultiplex 支持当前x上维度作图例
        supportLegend() {
            return { isSupport: true, isDimension: true, isPie: false, isMeasure: true, isMultiplex: false }
        },
        moreSetConfig() {
            //更多设置中可配置项
            return { dataZoom: true, legendShow: true, axisPointerShow: true, colorSeries: true }
        }
    })
})

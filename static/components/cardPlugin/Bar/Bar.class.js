import Util from '@/module/common/Util'
// import './BarRegisters'

const util = new Util()
define(['lib/echartBase/ChartBase.linearLine'], function(LinearLine) {
    class Bar extends LinearLine {
        constructor(option = {}) {
            super(option)
        }
        setDataSource(data = this.chartsCacheData, card = {}, type, timeLineCreated, calculateData) {
            this.chartsCacheData = data
            data.rs && super.null2zero(data.rs, super.dimensionTitle(card))
            super.setDataSource(data, card, type, timeLineCreated, calculateData)
        }
        utilIsArray(item) {
            return Object.prototype.toString.call(item) === '[object Array]'
        }
        // loop(arr, callback) {
        //     if (!this.utilIsArray(arr)) return
        //     for (var i = 0, len = arr.length; i < len; i++) {
        //         var item = arr[i]
        //         if (this.utilIsArray(item)) {
        //             this.loop(item, callback)
        //         } else {
        //             callback && callback(item, i, arr)
        //         }
        //     }
        // }
        // null2zero(data = {}) {
        //     for (var k in data) {
        //         var item = data[k]
        //         this.loop(item, (innerItem, innerIndex, innerArray) => {
        //             if (innerItem === null) {
        //                 innerArray[innerIndex] = 0
        //             }
        //         })
        //     }
        // }
        _toolTipFormatter(params) {
            let [axisValue, ar] = ['', []]
            if (_.isArray(params)) {
                ar = params.reduce((arr, v) => {
                    axisValue = v.axisValue
                    // 趋势线不展示tips
                    if (v.seriesType == 'custom') {
                        return arr
                    }
                    let value = _.isArray(v.value) ? v.value[v.seriesIndex + 1] : v.value
                    // 处理渐变图例 fxy 2020/1/27 136352 这里就没有处理方向了，只处理了颜色
                    if (typeof v.color === 'object') {
                        let sColor = v.color.colorStops[0].color
                        let eColor = v.color.colorStops[1].color
                        v.marker = v.marker.replace(
                            'background-color:[object Object]',
                            `background-image:linear-gradient(${sColor}, ${eColor})`
                        )
                    }
                    arr.push({ marker: v.marker, seriesName: v.seriesName, value })
                    return arr
                }, [])
                ar.unshift(axisValue)
            }
            //预测线多度量多线的情况下， 多余的（为0）值去重
            if (/^(预测|Forcast)[123]$/g.test(axisValue)) {
                let sValMap = {}
                for (let i = 0; i < ar.length; i++) {
                    if (i === 0) {
                        continue
                    }
                    if (ar[i].seriesName in sValMap) {
                        let idx = i
                        if (ar[i].value !== 0 && sValMap[ar[i].seriesName].value === 0) {
                            idx = sValMap[ar[i].seriesName].index
                        }
                        ar.splice(idx, 1)
                        i--
                    } else {
                        sValMap[ar[i].seriesName] = { value: ar[i].value, index: i }
                    }
                }
            }
            //undefined的值 没有数据意义 不展示
            return ar
                .filter(item => {
                    if (_.isObject(item)) {
                        return item.value !== void 0
                    } else {
                        return true
                    }
                })
                .map((v, i) => {
                    if (i > 0) {
                        return v.marker + v.seriesName + '：' + v.value
                    } else {
                        return v
                    }
                })
                .join('<br/>')
        }
        // add by renfei SF2049 2018-8-2 #81795 让tooltip无法超出图表范围
        _toolTipPosition(pos, params, dom, rect, size) {
            let obj = { top: (size.viewSize[1] - dom.offsetHeight) / 2 }
            if (pos[0] < size.viewSize[0] / 2) {
                obj.left = pos[0] + 40
            } else {
                obj.right = size.viewSize[0] - pos[0] + 50
            }
            return obj
        }

        _setCardFormatter(options) {
            let [categoryAxis, valueAxis] = [null, null]
            let self = this
            options = options.baseOption || options
            if (options.xAxis[0].type === 'category') {
                categoryAxis = 'xAxis'
                valueAxis = 'yAxis'
            } else {
                categoryAxis = 'yAxis'
                valueAxis = 'xAxis'
            }
            options.series.forEach(item => {
                options[valueAxis][item[`${valueAxis}Index`]] &&
                    !options[valueAxis][item[`${valueAxis}Index`]].axisLabel &&
                    (options[valueAxis][item[`${valueAxis}Index`]].axisLabel = {})
                let _axisLabel =
                    (options[valueAxis][item[`${valueAxis}Index`]] &&
                        options[valueAxis][item[`${valueAxis}Index`]].axisLabel) ||
                    {}
                !item.label && (item.label = {})
                item.label.formatter = function(params) {
                    return self.util.format(
                        { columnName: item._$measureName || item.name },
                        _.isArray(params.value) ? params.value[params.seriesIndex + 1] : params.value,
                        self.card
                    )
                }
                _axisLabel.formatter = self.util.argsAOP(
                    _axisLabel.formatter ||
                        function(value) {
                            return value
                        },
                    _proxy({ columnName: item._$measureName || item.name })
                )
            })

            options[categoryAxis].forEach(item => {
                !item.axisLabel && (item.axisLabel = {})
                item.axisLabel.formatter = self.util.argsAOP(
                    item.axisLabel.formatter ||
                        function(value) {
                            return value
                        },
                    _proxy({ columnName: item._name })
                )
                item.axisLabel.rich = {
                    0: {
                        fontStyle: 'italic',
                        color: '#ccc',
                        fontSize: item.axisLabel.fontSize
                    }
                }
            })
            ;(options.axisPointer.label = {
                formatter: function() {}
            }),
                (options.axisPointer.label.formatter = function(param) {
                    let myValue = param.value
                    let flag = '_1#5@46x5X9t4a0S75'
                    let value = ''
                    if (typeof myValue === 'string' && myValue.indexOf(flag) !== -1) {
                        value = myValue.split(flag).join('_')
                    }
                    if (typeof myValue === 'number') {
                        value = myValue.toFixed(2)
                    }
                    if (param.value === '{0|null}') {
                        value = 'null'
                    }
                    return value || myValue
                })
            options.tooltip.formatter = self.util.argsAOP(options.tooltip.formatter, function() {
                let args = [].slice.call(arguments)
                let series = args[0]
                Array.isArray(series) &&
                    series.forEach(item => {
                        _.isArray(item.value)
                            ? ((item.value = item.value.slice(0)),
                              item.value.splice(
                                  item.seriesIndex + 1,
                                  1,
                                  self.util.format(
                                      { columnName: item.seriesName },
                                      item.value[item.seriesIndex + 1],
                                      self.card,
                                      null,
                                      true
                                  )
                              ))
                            : (item.value = self.util.format(
                                  {
                                      columnName: self.card.xAxis.concat(self.card.yAxis).find(innerItem => {
                                          return innerItem.columnType == 2
                                      }).columnName
                                  },
                                  item.value,
                                  self.card,
                                  null,
                                  true
                              ))
                        item.axisValue = self.util.format(
                            {
                                columnName: self.util.readObject(
                                    `${item.axisDim}Axis.${item.axisIndex}._name`,
                                    self.option.baseOption || self.option
                                )
                            },
                            item.axisValue,
                            self.card,
                            true,
                            true
                        )
                        // item.seriesName = self.util.format(
                        //     {
                        //         columnName: self.util.readObject(
                        //             `${item.axisDim}Axis.${item.axisIndex}._name`,
                        //             self.option.baseOption || self.option
                        //         )
                        //     },
                        //     item.seriesName,
                        //     self.card,
                        //     null,
                        //     true
                        // )
                    })
                return args
            })

            function _proxy(opt) {
                return function() {
                    let args = [].slice.call(arguments)
                    args[0] = self.util.format(opt, args[0], self.card)
                    return args
                }
            }
        }
        beforeSetOption(options) {
            this._setCardFormatter(options)
        }
        /**
         * @Description: 告警设置钩子函数 nts 2020.5.8
         * @method: setWarning
         * @param: {}
         * @return: {}
         */
        setWarning(chartsOptions, data = this.chartsCacheData) {
            let self = this
            let card = self.card
            if (data && data.analysis == null) {
                if (chartsOptions.warnConditionTips) {
                    chartsOptions.warnConditionTips = null
                }
            }
            chartsOptions =
                (typeof this.beforeSetWarning === 'function' && this.beforeSetWarning(chartsOptions)) || chartsOptions
            data &&
                card.analysis.forEach(item => {
                    if (
                        data.analysis &&
                        typeof self.setWarningInfo === 'function' &&
                        item.componentType === 'warning'
                    ) {
                        chartsOptions = self.setWarningInfo(
                            item,
                            chartsOptions,
                            data.analysis,
                            [].concat(card.xAxis, card.yAxis)
                        )
                        return
                    }
                })
            return (
                (typeof this.beforeSetWarninged === 'function' && this.beforeSetWarninged(chartsOptions)) ||
                chartsOptions
            )
        }
        /**
         * @Description: 条形图告警设置处理 nts 2020.4.11
         * @method: setWarningInfo
         * @param: {}
         * @return: {}
         */
        setWarningInfo(analysisOptions, chartsOptions, data, axis, calculateData) {
            let resultsMap = data[analysisOptions.analysisId] && data[analysisOptions.analysisId].resultsMap
            let visualMap = []
            let warnConditionTips = ''
            const isExchange = this.util.isXYExchange(this.chartsType, this.card)
            const axisName = isExchange ? 'yAxis' : 'xAxis'
            const legendDimen = this.card.legend[0] && this.card.legend[0].dataType === 'dimension'
            if (!resultsMap || !chartsOptions.dataset || !chartsOptions.dataset.dimensions) return chartsOptions
            if (!Object.values(resultsMap).length) {
                if (chartsOptions.warnConditionTips) {
                    let filterVisualMap =
                        chartsOptions.visualMap.filter(item => item.v_id !== analysisOptions.analysisId) || []
                    filterVisualMap.length
                        ? (chartsOptions.visualMap = filterVisualMap)
                        : delete chartsOptions.visualMap
                    delete chartsOptions.warnConditionTips
                }
                return chartsOptions
            }
            chartsOptions.series.map(iSeries => {
                if (!iSeries.name) return iSeries
                const iSeriesName = iSeries._$measureName ? iSeries._$measureName : iSeries.name
                // let condition = analysisOptions.model.filter(item => item.name === iSeries.name)[0].condition || []
                let lienData = resultsMap[iSeriesName]
                const targetAnalysis = analysisOptions.model.find(item => item.name === iSeriesName)
                if (!targetAnalysis) return
                const condition = targetAnalysis.condition || []
                let markLineData = []
                let sIndex = chartsOptions.dataset.dimensions.findIndex(item => item === iSeriesName)
                let piecesData = []
                let visualMapObj = {}
                for (let attr in lienData) {
                    let curInfo = condition.find(item => item.expr === lienData[attr].expr)
                    if (!curInfo) {
                        continue
                    }
                    let emphasis_lineStyle_width = curInfo.warnLine.width + 1
                    // iLine为true绘制告警线
                    for (let i = 0; i < lienData[attr].events.length; i++) {
                        let item = lienData[attr].events[i]
                        let idx = i
                        if (legendDimen && iSeries.data && curInfo.warnColor.show) {
                            for (let j = 0; j < iSeries.data.length; j++) {
                                if (iSeries.data[j] === item.value || iSeries.data[j].value === item.value) {
                                    iSeries.data[j] = {
                                        value: item.value,
                                        itemStyle: {
                                            normal: {
                                                color: curInfo.warnColor.color
                                            }
                                        }
                                    }
                                    warnConditionTips += `${curInfo.content.replace(
                                        /\${=DV}/g,
                                        `${item.tagId} ${iSeries.name} ${item.value}`
                                    )} <br/>`
                                }
                            }
                        } else {
                            warnConditionTips += `${curInfo.content.replace(
                                /\${=DV}/g,
                                `${item.tagId} ${iSeries.name} ${item.value}`
                            )}  <br/>`
                        }
                        if (idx === 0 && analysisOptions.iLine && curInfo && curInfo.warnLine.show) {
                            let lineParams = {
                                [axisName]: curInfo.value.replace(/[^-|.|\d]/g, ''),
                                symbolSize: 6,
                                lineStyle: {
                                    color: curInfo.warnLine.color,
                                    width: curInfo.warnLine.width,
                                    type: curInfo.warnLine.type
                                },
                                label: {
                                    show: false,
                                    position: 'middle',
                                    formatter: function() {
                                        switch (curInfo.compute) {
                                            case 'in':
                                                return `${curInfo.min}<=${curInfo.name}<=${curInfo.max}`
                                            case '==':
                                                return `${curInfo.name + '=' + curInfo.value}`
                                            default:
                                                return `${curInfo.name + curInfo.compute + curInfo.value}`
                                        }
                                    }
                                },
                                emphasis: {
                                    lineStyle: {
                                        width: emphasis_lineStyle_width,
                                        type: curInfo.warnLine.type
                                    },
                                    label: { show: true }
                                },
                                warningLine: true,
                                warningId: curInfo.warnId
                            }
                            if (curInfo.compute === 'in') {
                                let lienDataCopy = JSON.parse(JSON.stringify(lienData[attr]))
                                let sort = lienDataCopy.sort((a, b) => a.value - b.value)
                                markLineData.push(
                                    Object.assign(_.clone(lineParams), {
                                        xAxis: sort[0].value
                                    })
                                )
                                markLineData.push(
                                    Object.assign(_.clone(lineParams), {
                                        xAxis: sort[sort.length - 1].value
                                    })
                                )
                            } else {
                                markLineData.push(lineParams)
                            }
                        }
                        // iColor为true添加颜色
                        if (
                            !legendDimen &&
                            analysisOptions.iColor &&
                            curInfo &&
                            curInfo.warnColor.show &&
                            sIndex !== -1
                        ) {
                            piecesData.push({
                                value: item.value,
                                color: curInfo.warnColor.color
                            })
                        }
                    }
                }
                visualMapObj = {
                    show: false,
                    pieces: util.piecesFilter(piecesData),
                    outOfRange: { color: chartsOptions.color[sIndex - 1] },
                    v_id: analysisOptions.analysisId
                }
                if (!iSeries._$measureName) {
                    visualMapObj.seriesIndex = sIndex - 1
                    visualMapObj.dimension = sIndex
                }
                !legendDimen && visualMapObj.pieces.length && visualMap.push(visualMapObj)
                if (markLineData.length) {
                    if (iSeries.markLine) {
                        let oldMarkLine = iSeries.markLine.data.filter(item => item.warningLine === undefined)
                        iSeries.markLine.data = [...oldMarkLine, ...markLineData]
                    } else {
                        iSeries.markLine = {
                            data: markLineData,
                            symbolSize: 0
                        }
                    }
                }
            })
            chartsOptions.visualMap = visualMap
            chartsOptions.warnConditionTips = warnConditionTips
            return chartsOptions
        }
    }
    return Bar
})

<template>
  <div ref="chart" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineProps } from 'vue'
import * as echarts from 'echarts'

const chart = ref(null)
let myChart = null

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
})

const initChart = () => {
  myChart = echarts.init(chart.value)
  myChart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['访问量', '用户量']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '访问量',
        type: 'line',
        stack: '总量',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: []
      },
      {
        name: '用户量',
        type: 'line',
        stack: '总量',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: []
      }
    ]
  })
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', myChart.resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', myChart.resize)
  myChart.dispose()
})

watch(
  () => props.chartData,
  (newVal) => {
    if (newVal && myChart) {
      myChart.setOption({
        xAxis: {
          data: newVal.xData
        },
        series: [
          {
            data: newVal.seriesData[0]
          },
          {
            data: newVal.seriesData[1]
          }
        ]
      })
    }
  },
  { deep: true, immediate: true }
)
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 300px;
}
</style>

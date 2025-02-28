<template>
  <div ref="chart" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const chart = ref(null)
let myChart = null

const initChart = () => {
  myChart = echarts.init(chart.value)
  myChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '用户分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
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

const props = defineProps({
  chartData: {
    type: Array,
    required: true
  }
})

watch(
  () => props.chartData,
  (newVal) => {
    if (newVal && myChart) {
      myChart.setOption({
        series: [
          {
            data: newVal
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

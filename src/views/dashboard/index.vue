<template>
  <div class="dashboard-container">
    <!-- 数据概览卡片 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in statisticsData" :key="item.title">
        <el-card shadow="hover" class="statistics-card">
          <div class="card-header">
            <el-icon :size="24" :class="item.iconClass">
              <component :is="item.icon" />
            </el-icon>
            <div class="card-title">{{ item.title }}</div>
          </div>
          <div class="card-value">{{ item.value }}</div>
          <div class="card-footer">
            <span :class="{ 'text-success': item.growth > 0, 'text-danger': item.growth < 0 }">
              {{ item.growth > 0 ? '+' : '' }}{{ item.growth }}%
            </span>
            <span class="text-gray">较上周</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header-title">
              <span>访问趋势</span>
              <el-radio-group v-model="chartTimeRange" size="small" @change="handleTimeRangeChange">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">全年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="h-[300px]">
            <line-chart :chart-data="lineChartData" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header-title">
              <span>用户分布</span>
            </div>
          </template>
          <div class="h-[300px]">
            <pie-chart :chart-data="pieChartData" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <el-row class="mt-4">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header-title">
              <span>最近活动</span>
              <el-button type="primary" link>查看更多</el-button>
            </div>
          </template>
          <el-table :data="recentActivities" style="width: 100%">
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="user" label="用户" width="180" />
            <el-table-column prop="action" label="操作" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === '成功' ? 'success' : 'danger'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, ShoppingCart, Goods, Money } from '@element-plus/icons-vue'
import LineChart from '@/components/Charts/LineChart.vue'
import PieChart from '@/components/Charts/PieChart.vue'

// 统计数据
const statisticsData = [
  {
    title: '总用户数',
    value: '13,521',
    icon: User,
    iconClass: 'text-blue-500',
    growth: 12.5
  },
  {
    title: '订单总数',
    value: '1,352',
    icon: ShoppingCart,
    iconClass: 'text-green-500',
    growth: 3.2
  },
  {
    title: '商品总数',
    value: '2,321',
    icon: Goods,
    iconClass: 'text-yellow-500',
    growth: -2.1
  },
  {
    title: '总收入',
    value: '¥89,232',
    icon: Money,
    iconClass: 'text-red-500',
    growth: 15.3
  }
]

// 图表时间范围
const chartTimeRange = ref('week')

// 折线图数据
const lineChartData = ref({
  xData: [],
  seriesData: [[], []]
})

// 饼图数据
const pieChartData = ref([
  { value: 1048, name: '华东地区' },
  { value: 735, name: '华北地区' },
  { value: 580, name: '华南地区' },
  { value: 484, name: '西北地区' },
  { value: 300, name: '西南地区' }
])

// 最近活动数据
const recentActivities = [
  {
    time: '2024-02-27 10:00:00',
    user: '张三',
    action: '登录系统',
    status: '成功'
  },
  {
    time: '2024-02-27 09:45:23',
    user: '李四',
    action: '创建订单',
    status: '成功'
  },
  {
    time: '2024-02-27 09:30:12',
    user: '王五',
    action: '修改商品信息',
    status: '成功'
  },
  {
    time: '2024-02-27 09:15:45',
    user: '赵六',
    action: '删除商品',
    status: '失败'
  },
  {
    time: '2024-02-27 09:15:45',
    user: '赵六',
    action: '删除商品',
    status: '失败'
  },
  {
    time: '2024-02-27 09:15:45',
    user: '赵六',
    action: '删除商品',
    status: '失败'
  },
  {
    time: '2024-02-27 09:15:45',
    user: '赵六',
    action: '删除商品',
    status: '失败'
  },
  {
    time: '2024-02-27 09:15:45',
    user: '赵六',
    action: '删除商品',
    status: '失败'
  }
]

// 生成模拟数据
const generateChartData = (range) => {
  const now = new Date()
  const data = {
    xData: [],
    seriesData: [[], []]
  }

  let days = 7
  if (range === 'month') days = 30
  if (range === 'year') days = 12

  for (let i = 0; i < days; i++) {
    if (range === 'year') {
      data.xData.push(`${i + 1}月`)
    } else {
      const date = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000)
      data.xData.push(`${date.getMonth() + 1}/${date.getDate()}`)
    }

    data.seriesData[0].push(Math.floor(Math.random() * 1000 + 500))
    data.seriesData[1].push(Math.floor(Math.random() * 500 + 200))
  }

  return data
}

const handleTimeRangeChange = (range) => {
  lineChartData.value = generateChartData(range)
}

onMounted(() => {
  handleTimeRangeChange('week')
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 0; // 1rem to 16px

  .statistics-card {
    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px; // 1rem to 16px

      .el-icon {
        margin-right: 12px; // 0.75rem to 12px
      }

      .card-title {
        font-size: 14px; // 0.875rem to 14px
        color: #6b7280;
      }
    }

    .card-value {
      font-size: 24px; // 1.5rem to 24px
      font-weight: bold;
      margin-bottom: 8px; // 0.5rem to 8px
    }

    .card-footer {
      font-size: 14px; // 0.875rem to 14px

      .text-success {
        color: #10b981;
      }

      .text-danger {
        color: #ef4444;
      }

      .text-gray {
        color: #9ca3af;
        margin-left: 8px; // 0.5rem to 8px
      }
    }
  }

  .card-header-title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 18px; // 1.125rem to 18px
      font-weight: 500;
    }
  }
}
</style>

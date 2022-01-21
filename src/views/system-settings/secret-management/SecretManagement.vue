<template>
  <div class="wrapper">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane v-for="item in TAB_LISTS" :key="item.name" :label="item.label" :name="item.name">
        {{ item.label }}
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'

import { TAB_LISTS } from './constant'

const activeName = ref(TAB_LISTS[0].name)
</script>

<style lang="scss" scoped>
.wrapper {
}
</style>

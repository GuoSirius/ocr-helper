<template>
  <el-container class="wrapper">
    <el-header height="auto">
      <el-card>
        <el-form ref="form" :model="formModel" inline>
          <el-form-item label="应用名称：" prop="name">
            <el-input v-model.trim="formModel.name" placeholder="请输入应用名称" />
          </el-form-item>

          <el-form-item label="应用ID：" prop="appId">
            <el-input v-model.trim="formModel.appId" placeholder="请输入应用ID" />
          </el-form-item>

          <el-form-item label="激活状态：" prop="isActive">
            <el-input v-model.trim="formModel.isActive" placeholder="请输入激活状态" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click.stop="queryHandler">查询</el-button>
            <el-button type="default" @click.stop="resetHandler">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-header>

    <el-main>OcrRecognize</el-main>
  </el-container>
</template>

<script setup>
import { reactive } from 'vue'

import { useGlobalProperties } from '@/use-hooks/global-properties'
import { useFormModel } from '@/use-hooks/form-model'

const { $message } = useGlobalProperties()
const { form, resetHandler } = useFormModel()

const formModel = reactive({
  name: '',
  code: ''
})

function queryHandler() {
  $message.success('识别中')
}
</script>

<style lang="scss" scoped>
.wrapper {
}
</style>

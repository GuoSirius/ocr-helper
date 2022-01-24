<template>
  <el-container class="wrapper">
    <el-header height="auto">
      <el-card>
        <el-form ref="form" :model="formModel" inline inline-message>
          <el-form-item label="字典名字：" prop="name">
            <el-input v-model="formModel.name" placeholder="请输入字典名字" />
          </el-form-item>

          <el-form-item label="字典编码：" prop="code">
            <el-input v-model="formModel.code" placeholder="请输入字典编码" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click.stop="queryHandler">查询</el-button>
            <el-button type="default" @click.stop="resetHandler">重置</el-button>

            <el-button type="success" icon="Plus" @click.stop="queryHandler">新增</el-button>
            <el-button type="danger" icon="Delete" @click.stop="resetHandler">删除</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-header>

    <el-main>
      <el-table
        :data="tableData"
        stripe
        border
        highlight-current-row
        :current-row-key="ROW_KEY"
        :row-key="ROW_KEY"
        height="100%"
        max-height="100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" fixed />
        <el-table-column prop="name" label="名称" width="180" align="center" />
        <el-table-column prop="code" label="编码" width="180" align="center" />
        <el-table-column prop="isDisabled" label="状态" align="center" />
        <el-table-column label="操作" align="center" fixed>
          <el-button type="danger" icon="Delete" circle></el-button>
        </el-table-column>
      </el-table>
    </el-main>

    <el-footer height="auto">
      <el-pagination
        v-model:currentPage="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :layout="LAYOUT"
        :page-sizes="PAGE_SIZES"
        background
      />
    </el-footer>
  </el-container>
</template>

<script setup>
import { /* ref, */ reactive } from 'vue'

import { useFormModel } from '@/use-hooks/form-model'
import { ROW_KEY, LAYOUT, PAGE_SIZES, useTable } from '@/use-hooks/table-pagination'

const { form, resetHandler } = useFormModel(getDictionaryLists)
const { tableData, currentPage, pageSize, total } = useTable(getDictionaryLists)

const formModel = reactive({
  name: '',
  code: ''
})

function queryHandler() {
  getDictionaryLists()
}

function getDictionaryLists() {
  console.log(currentPage.value)
  console.log(formModel)
}
</script>

<style lang="scss" scoped>
.wrapper {
}
</style>

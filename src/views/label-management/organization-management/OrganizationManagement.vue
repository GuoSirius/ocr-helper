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

            <el-button type="success" icon="Plus" @click.stop="addHandler">新增</el-button>
            <!-- <el-button type="danger" icon="Delete" @click.stop="deleteHandler">删除</el-button> -->
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
        <el-table-column prop="name" label="应用名称" min-width="160" align="center" />
        <el-table-column prop="appId" label="应用ID" min-width="160" align="center" />
        <el-table-column prop="isActive" label="激活状态" width="100" align="center" />
        <el-table-column label="操作" width="160" align="center" fixed="right" #default="{ row }">
          <el-button type="primary" icon="Edit" circle @click="editHandler(row)"></el-button>
          <el-popconfirm title="你确定要删除?" @confirm="deleteHandler(row)">
            <template #reference>
              <el-button type="danger" icon="Delete" circle></el-button>
            </template>
          </el-popconfirm>
        </el-table-column>
      </el-table>
    </el-main>

    <el-footer height="auto">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :layout="LAYOUT"
        :page-sizes="PAGE_SIZES"
        background
      />
    </el-footer>

    <add-edit-dialog v-model="isVisibleForAddEdit" :id="currentId" @success="successHandler" />
  </el-container>
</template>

<script setup>
import { ref, reactive } from 'vue'

import { getDictionaryPaginationLists, deleteDictionary } from '@/api/dictionary'

import { useGlobalProperties } from '@/use-hooks/global-properties'
import { useFormModel } from '@/use-hooks/form-model'
import { ROW_KEY, LAYOUT, PAGE_SIZES, useTable } from '@/use-hooks/table-pagination'

import AddEditDialog from './AddEditDialog.vue'

const { $message } = useGlobalProperties()
const { form, resetHandler } = useFormModel(getDictionaryLists)
const { tableData, currentPage, pageSize, total } = useTable(getDictionaryLists)

const formModel = reactive({
  name: '',
  code: ''
})

const currentId = ref('')
const isVisibleForAddEdit = ref(false)

getDictionaryLists()

function getDictionaryLists() {
  getDictionaryPaginationLists({ ...formModel, currentPage: currentPage.value, pageSize: pageSize.value }).then(
    ({ code, message, data }) => {
      if (code) return void $message.error(message)

      const lists = data?.lists || []
      const _total = data?.total || 0

      tableData.value = lists
      total.value = _total
    }
  )
}

function queryHandler() {
  currentPage.value = 1

  getDictionaryLists()
}

function addHandler() {
  isVisibleForAddEdit.value = true
}

function editHandler(row) {
  const { id } = row

  currentId.value = id
  isVisibleForAddEdit.value = true
}

function deleteHandler(row) {
  const { id } = row

  deleteDictionary(id).then(({ code, message }) => {
    if (code) return $message.error(message)

    queryHandler()

    $message.success('字典删除成功')
  })
}

function successHandler() {
  getDictionaryLists()
}
</script>

<style lang="scss" scoped>
.wrapper {
}
</style>

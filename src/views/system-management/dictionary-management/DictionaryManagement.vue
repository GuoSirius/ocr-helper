<template>
  <el-container class="wrapper">
    <el-header height="auto">
      <el-card>
        <el-form ref="form" :model="formModel" inline>
          <el-form-item label="字典名字：" prop="name">
            <el-input v-model.trim="formModel.name" placeholder="请输入字典名字" />
          </el-form-item>

          <el-form-item label="字典编码：" prop="code">
            <el-input v-model.trim="formModel.code" placeholder="请输入字典编码" />
          </el-form-item>

          <el-form-item label="删除状态：" prop="isDeleted">
            <el-input v-model.trim="formModel.isDeleted" placeholder="请输入删除状态" />
          </el-form-item>

          <el-form-item label="禁用状态：" prop="isDisabled">
            <el-input v-model.trim="formModel.isDisabled" placeholder="请输入禁用状态" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click.stop="queryHandler">查询</el-button>
            <el-button type="default" @click.stop="resetHandler">重置</el-button>

            <el-button type="success" icon="Download" @click.stop="downloadHandler">下载模板</el-button>
            <el-button type="success" icon="Upload" @click.stop="importHandler">导入数据</el-button>
            <el-button type="success" icon="Download" @click.stop="exportHandler">导出数据</el-button>

            <el-button type="primary" icon="Plus" @click.stop="addHandler">新增</el-button>
            <el-button type="danger" icon="Delete" @click.stop="batchDeleteHandler">批量删除</el-button>
            <el-button type="success" icon="RefreshLeft" @click.stop="batchRestoreHandler">批量还原</el-button>
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
        <el-table-column prop="name" label="名称" min-width="160" align="center" />
        <el-table-column prop="code" label="编码" min-width="160" align="center" />
        <el-table-column prop="order" label="排序" width="100" align="center" />
        <el-table-column prop="createTimeDate" label="创建时间" width="180" align="center" />
        <el-table-column prop="updateTimeDate" label="更新时间" width="180" align="center" />
        <el-table-column prop="deleteTimeDate" label="删除时间" width="180" align="center" />
        <el-table-column prop="isDisabled" label="禁用状态" width="100" align="center" #default="{ row }">
          <el-switch
            v-model="row.isDisabled"
            inline-prompt
            active-text="N"
            inactive-text="Y"
            :active-value="false"
            :inactive-value="true"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="changeDisabledHandler($event, row)"
          />
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right" #default="{ row }">
          <el-button type="primary" icon="Edit" circle @click="editHandler(row)"></el-button>
          <el-popconfirm v-if="row.deleteTime" title="你确定要还原?" @confirm="restoreHandler(row)">
            <template #reference>
              <el-button type="success" icon="RefreshLeft" circle></el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm v-else title="你确定要删除?" @confirm="deleteHandler(row)">
            <template #reference>
              <el-button type="danger" icon="Delete" circle></el-button>
            </template>
          </el-popconfirm>
          <el-popconfirm title="你确定要彻底删除?" @confirm="hardDeleteHandler(row)">
            <template #reference>
              <el-button type="danger" icon="DeleteFilled" circle></el-button>
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

import { getDictionaryPaginationLists, updateDictionary, deleteDictionary, restoreDictionary } from '@/api/dictionary'

import { useGlobalProperties } from '@/use-hooks/global-properties'
import { useFormModel } from '@/use-hooks/form-model'
import { ROW_KEY, LAYOUT, PAGE_SIZES, useTable } from '@/use-hooks/table-pagination'

import AddEditDialog from './AddEditDialog.vue'

const { $message } = useGlobalProperties()
const { form, resetHandler } = useFormModel(getDictionaryLists)
const { tableData, currentPage, pageSize, total } = useTable(getDictionaryLists)

const formModel = reactive({
  name: '',
  code: '',
  isDeleted: '',
  isDisabled: ''
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

function restoreHandler(row) {
  const { id } = row

  restoreDictionary(id).then(({ code, message }) => {
    if (code) return $message.error(message)

    getDictionaryLists()

    $message.success('字典还原成功')
  })
}

function batchRestoreHandler() {
  // TODO
}

function deleteHandler(row, isHardDelete = false) {
  const { id } = row

  deleteDictionary(id, isHardDelete).then(({ code, message }) => {
    if (code) return $message.error(message)

    getDictionaryLists()

    $message.success('字典删除成功')
  })
}

function hardDeleteHandler(row) {
  deleteHandler(row, true)
}

function batchDeleteHandler() {
  // TODO
}

function downloadHandler() {
  // TODO
}

function importHandler() {
  // TODO
}

function exportHandler() {
  // TODO
}

function changeDisabledHandler(currentValue, row) {
  const { id } = row

  updateDictionary({ id, isDisabled: currentValue }).then(({ code, message }) => {
    if (code) {
      row.isDisabled = !currentValue

      return $message.error(message)
    }

    getDictionaryLists()

    $message.success('字典状态更新成功')
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

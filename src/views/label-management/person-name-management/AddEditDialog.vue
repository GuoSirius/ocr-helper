<template>
  <gs-dialog v-model="isVisible" :title="title" @open="openHandler" @close="closeHandler">
    <el-container>
      <el-main>
        <el-form ref="form" :model="formModel" :rules="formRules" label-width="auto" status-icon>
          <el-form-item label="字典父级：" prop="parentId">
            <el-input v-model="formModel.parentId" placeholder="请选择字典父级" />
          </el-form-item>

          <el-form-item label="字典名字：" prop="name">
            <el-input v-model.trim="formModel.name" placeholder="请输入字典名字" />
          </el-form-item>

          <el-form-item label="字典编码：" prop="code">
            <el-input v-model.trim="formModel.code" placeholder="请输入字典编码" />
          </el-form-item>

          <el-form-item label="排序：" prop="order">
            <el-input-number v-model.number="formModel.order" controls-position="right" />
          </el-form-item>

          <el-form-item label="状态：" prop="isDisabled">
            <el-radio-group v-model="formModel.isDisabled">
              <el-radio v-for="(item, index) in STATUS_LISTS" :key="index" :label="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>

    <template #footer>
      <span class="dialog-footer">
        <el-button plain @click.stop="cancelHandler">取消</el-button>
        <el-button type="primary" @click.stop="saveHandler">保存</el-button>
      </span>
    </template>
  </gs-dialog>
</template>

<script setup>
import { ref, reactive, computed, defineProps, defineEmits } from 'vue'

import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'
import keys from 'lodash/keys'

import { STATUS_LISTS, addDictionary, updateDictionary, getDictionary } from '@/api/dictionary'

import { useGlobalProperties } from '@/use-hooks/global-properties'

import { FORM_MODEL, FORM_RULES } from './validator'

const { $message } = useGlobalProperties()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  id: { type: String, default: '' }
})

const emit = defineEmits({
  success: null,
  'update:modelValue': null
})

const formModel = reactive(cloneDeep(FORM_MODEL))

const formRules = reactive(FORM_RULES)

const form = ref()

const isVisible = computed({
  get: () => props.modelValue,
  set(val) {
    emit('update:modelValue', val)
  }
})

const title = computed(() => (props.id ? '编辑人名' : '编辑人名'))

function openHandler() {
  const { id } = props

  if (id) {
    getDictionary(id).then(({ code, message, data }) => {
      if (code) return void $message.error(message)

      keys(formModel).forEach(key => {
        formModel[key] = data[key] ?? formModel[key]
      })
    })
  }
}

function closeHandler() {
  merge(formModel, FORM_MODEL)
  form.value.resetFields()
}

function cancelHandler() {
  isVisible.value = false
}

function saveHandler() {
  let requestPromise = null

  form.value.validate().then(isValid => {
    if (!isValid) return

    const { id } = props
    const _message = id ? '字典更新成功' : '字典新增成功'

    if (id) requestPromise = updateDictionary({ ...formModel, id })
    else requestPromise = addDictionary({ ...formModel })

    requestPromise.then(({ code, message }) => {
      if (code) return void $message.error(message)

      isVisible.value = false
      $message.success(_message)

      emit('success')
    })
  })
}
</script>

<style lang="scss" scoped>
.wrapper {
}
</style>

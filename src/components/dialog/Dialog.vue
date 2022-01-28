<template>
  <el-dialog
    v-model="isVisible"
    :center="center"
    :append-to-body="appendToBody"
    :destroy-on-close="destroyOnClose"
    :close-on-click-modal="closeOnClickModal"
    v-bind="$attrs"
  >
    <template #title> <slot name="title"></slot> </template>
    <slot></slot>
    <template #footer> <slot name="footer"></slot> </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  center: {
    type: Boolean,
    default: true
  },
  appendToBody: {
    type: Boolean,
    default: true
  },
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  closeOnClickModal: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits({
  'update:modelValue': null
})

const isVisible = computed({
  get: () => props.modelValue,
  set(val) {
    emit('update:modelValue', val)
  }
})
</script>

<style lang="scss" scoped>
.wrapper {
}
</style>

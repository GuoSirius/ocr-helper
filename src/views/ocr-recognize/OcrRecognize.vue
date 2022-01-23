<template>
  <el-container class="wrapper">
    <el-header height="auto">
      <el-form :model="formModel" inline inline-message size="small">
        <el-form-item label="选择文件夹:" prop="folder">
          <el-input v-model="formModel.folder" type="file" webkitdirectory></el-input>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main>34</el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'

import { nanoid } from 'nanoid'

import { addBillboard } from '@/electron/model/article'

addBillboard(nanoid())

const formModel = ref({
  folder: ''
})
</script>

<style lang="scss" scoped>
.wrapper {
}
</style>

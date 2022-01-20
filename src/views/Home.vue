<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
    <el-button type="primary">Primary</el-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import HelloWorld from '@/components/HelloWorld.vue' // @ is an alias to /src

import * as tencentcloud from 'tencentcloud-sdk-nodejs'
import '@/electron/ocr'
import '@/electron/ocr/Tencent'

console.log(process.env.ELECTRON_NODE_INTEGRATION, process.env.IS_TEST, process.env.NODE_ENV)
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
console.log(require('baidu-aip-sdk'))
console.log(tencentcloud)

export default defineComponent({
  name: 'Home',
  components: {
    HelloWorld
  }
})
</script>

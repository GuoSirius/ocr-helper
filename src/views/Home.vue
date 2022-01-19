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

// import * as b from 'baidu-aip-sdk'
import * as t from 'tencentcloud-sdk-nodejs'

// console.log(b)
console.log(t)

export default defineComponent({
  name: 'Home',
  components: {
    HelloWorld
  }
})
</script>

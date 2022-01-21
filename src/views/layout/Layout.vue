<template>
  <el-container class="wrapper">
    <el-header class="header">
      <div class="header-left">
        <el-icon
          size="32px"
          class="icon-expanded"
          :class="{ 'icon-collapsed': isCollapsed }"
          @click.stop="expandHandler"
        >
          <expand />
        </el-icon>

        <h2 class="header-title">OCR 识别助手</h2>
      </div>

      <div class="header-right">
        <el-icon size="32px" @click.stop="settingHandler"><setting /></el-icon>
      </div>
    </el-header>

    <el-container class="container">
      <el-aside width="240px" class="aside" :class="{ 'aside-collapsed': isCollapsed }">
        <el-scrollbar>
          <el-menu
            text-color="#bfcbd9"
            active-text-color="#409eff"
            background-color="#080829"
            router
            :collapse="isCollapsed"
            :default-active="route.fullPath"
          >
            <el-menu-item index="/ocr-recognize" :route="{ name: 'ocr-recognize' }">
              <el-icon><icon-menu /></el-icon>
              <template #title>OCR 识别</template>
            </el-menu-item>

            <el-sub-menu index="/system-settings">
              <template #title>
                <el-icon><setting /></el-icon>
                <span>系统设置</span>
              </template>

              <el-menu-item index="/label-management" :route="{ name: 'label-management' }">
                <el-icon><notebook /></el-icon>
                <template #title>标签管理</template>
              </el-menu-item>

              <el-menu-item index="/secret-management" :route="{ name: 'secret-management' }">
                <el-icon><platform /></el-icon>
                <template #title>秘钥管理</template>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </el-aside>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isCollapsed = ref(true)

function expandHandler() {
  isCollapsed.value = !isCollapsed.value
}

function settingHandler() {
  router.push({ name: 'settings' })
}
</script>

<style lang="scss" scoped>
.wrapper {
  .header {
    color: #fff;
    background-color: #397ae5;

    &-left {
      margin-top: 12px;
      float: left;
      vertical-align: middle;
      user-select: none;

      & > * {
        display: inline-block;
        vertical-align: middle;
      }

      .icon-expanded {
        margin-right: 16px;
        transform: rotateY(180deg);
        transition: transform 0.1s linear 0s;
        cursor: pointer;

        &.icon-collapsed {
          transform: rotateY(0deg);
        }
      }

      .header-title {
        font-size: 20px;
      }
    }

    &-right {
      margin-top: 14px;
      float: right;
      vertical-align: middle;
      user-select: none;

      & > * {
        display: inline-block;
        vertical-align: middle;
      }
    }
  }

  .container {
    height: calc(100% - 60px);
  }

  .aside {
    height: 100%;
    background-color: #080829;
    transition: all 0.3s linear 0s;

    &.aside-collapsed {
      width: 64px;

      .el-sub-menu.is-active {
        :deep(.el-sub-menu__title) {
          color: #409eff !important;
        }
      }
    }

    .el-menu {
      border-right: 0;
    }
  }

  .main {
    width: 100%;
    height: 100%;
    padding: 16px 12px 6px 18px;

    & > .wrapper:first-child {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  }
}
</style>

<template>
  <el-container class="wrapper">
    <el-header class="header">
      <div class="header-left">
        <el-icon size="32px" class="icon-expanded" @click.stop="expandHandler">
          <expand v-if="isCollapsed" />
          <fold v-else />
        </el-icon>

        <h2 class="header-title">OCR 识别助手</h2>
      </div>

      <div class="header-right">
        <el-icon title="标签管理" size="32px" @click.stop="labelHandler"><price-tag /></el-icon>
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

            <el-menu-item index="/secret-management" :route="{ name: 'secret-management' }">
              <el-icon><platform /></el-icon>
              <template #title>秘钥管理</template>
            </el-menu-item>

            <el-sub-menu index="/label-management">
              <template #title>
                <el-icon><management /></el-icon>
                <span>标签管理</span>
              </template>

              <el-menu-item index="/label-management" :route="{ name: 'label-management' }">
                <el-icon><discount /></el-icon>
                <template #title>标签管理</template>
              </el-menu-item>

              <el-menu-item index="/article-management" :route="{ name: 'article-management' }">
                <el-icon><goods /></el-icon>
                <template #title>物品管理</template>
              </el-menu-item>

              <el-menu-item index="/location-management" :route="{ name: 'location-management' }">
                <el-icon><place /></el-icon>
                <template #title>地点管理</template>
              </el-menu-item>

              <el-menu-item index="/datetime-management" :route="{ name: 'datetime-management' }">
                <el-icon><calendar /></el-icon>
                <template #title>时间管理</template>
              </el-menu-item>

              <el-menu-item index="/organization-management" :route="{ name: 'organization-management' }">
                <el-icon><office-building /></el-icon>
                <template #title>机构管理</template>
              </el-menu-item>

              <el-menu-item index="/person-name-management" :route="{ name: 'person-name-management' }">
                <el-icon><avatar /></el-icon>
                <template #title>人名管理</template>
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

import { LABEL_NAME } from './constant'

const route = useRoute()
const router = useRouter()

const isCollapsed = ref(true)

function expandHandler() {
  isCollapsed.value = !isCollapsed.value
}

function labelHandler() {
  router.push({ name: LABEL_NAME })
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
        cursor: pointer;
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
      border-right: none;
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

      :deep {
        .el-header,
        .el-main,
        .el-footer {
          padding: 0;

          &:not(:last-child) {
            margin-bottom: 16px;
          }
        }
      }
    }
  }
}
</style>

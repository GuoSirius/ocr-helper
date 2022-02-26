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
        <el-icon title="主页管理" size="32px" @click.stop="shortcutHandler(HOME_NAME)"><home-filled /></el-icon>
        <el-icon title="标签管理" size="32px" @click.stop="shortcutHandler(LABEL_NAME)"><price-tag /></el-icon>
        <el-icon title="字典管理" size="32px" @click.stop="shortcutHandler(SETTINGS_NAME)"><setting /></el-icon>
      </div>
    </el-header>

    <el-container class="main">
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
              <el-icon><lock /></el-icon>
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

              <el-menu-item index="/punctuation-management" :route="{ name: 'punctuation-management' }">
                <el-icon><platform /></el-icon>
                <template #title>标点管理</template>
              </el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="/system-management">
              <template #title>
                <el-icon><setting /></el-icon>
                <span>系统管理</span>
              </template>

              <el-menu-item index="/dictionary-management" :route="{ name: 'dictionary-management' }">
                <el-icon><tickets /></el-icon>
                <template #title>字典管理</template>
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </el-aside>

      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { HOME_NAME, LABEL_NAME, SETTINGS_NAME } from './constant'

const route = useRoute()
const router = useRouter()

const isCollapsed = ref(true)

function expandHandler() {
  isCollapsed.value = !isCollapsed.value
}

function shortcutHandler(name) {
  if (!name) return

  router.push({ name })
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

        &:not(:last-child) {
          margin-right: 16px;
        }
      }
    }
  }

  .main {
    // width: 100%;
    // max-width: initial;
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

  .content {
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

<script setup>
import WinTitle from './components/WinTitle.vue';
</script>

<template>
  <div>
    <div class="winTitle">
      <WinTitle></WinTitle>
    </div>
    <div class="winContent">
      <router-view></router-view>
    </div>
  </div>
</template>

<style>
@import './assets/css/global.css';

#app {
  font-family: 'Consolas', '微软雅黑', monospace, 'Microsoft YaHei',
    'hw-iconfont';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: all 0.3s;
  color: var(--primary-font-color);
  background: var(--background-color);
}

.winTitle {
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: var(--winTitle-height);
  background: var(--winTitle-color);
  box-shadow: var(--winTitle-boxShadow);
}

.winContent {
  width: 100%;
  height: calc(100vh - var(--winTitle-height));
}

.v3-menus {
  background: var(--background-color) !important;
  padding: unset !important;
  border-radius: 6px !important;
  overflow: hidden !important;
  min-width: 240px !important;
  box-shadow: 0 1px 3px #101010 !important;
}

.v3-menus-item {
  padding: 12px 30px 12px 24px !important;
  font-size: 14px !important;
  line-height: unset !important;
}

.v3-menus-active {
  background: var(--fileItem-color) !important;
  color: var(--primary-font-color) !important;
}

.v3-menus-icon {
  position: relative;
}

.MenusIcon {
  height: 20px;
  position: absolute;
  top: -10px;
  left: -5px;
}

.v3-menus-tip {
  font-size: 14px !important;
  color: #606266 !important;
}

.v3-menus-divided {
  border-color: var(--fileItem-color) !important;
}
</style>

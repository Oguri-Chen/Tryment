<script setup>
import { ref } from 'vue';
const ipcRenderer = window.electron.ipcRenderer;

const isLight = ref(false);

if (localStorage.getItem('isLight')) {
  isLight.value = localStorage.getItem('isLight') == 'true';
  document.documentElement.setAttribute(
    'theme',
    isLight.value ? 'light' : ''
  );
}

const btnThemeChange = () => {
  isLight.value = !isLight.value;
  document.documentElement.setAttribute(
    'theme',
    isLight.value ? 'light' : ''
  );
  localStorage.setItem('isLight', isLight.value);
},
  btnMinimize = () => ipcRenderer.send('min'),
  btnMaximize = () => ipcRenderer.send('max'),
  btnWinClose = () => ipcRenderer.send('close');

</script>

<template>
  <div class="winTitle">
    <div class="Logo">
      <img src="/icon/icon.svg" class="icon" />
      <img src="/icon/logo.svg" class="title" />
    </div>
    <div class="WinTitleControl"></div>
    <div class="Control">
      <div class="Button" @click="btnThemeChange">
        <img src="/icon/moon.svg" v-if=!isLight style="height: 18px" />
        <img src="/icon/sun.svg" v-else style="height: 20px" />
      </div>
      <div class="Button" @click="btnMinimize">
        <img src="/icon/minimize.svg" />
      </div>
      <div class="Button" @click="btnMaximize">
        <img src="/icon/maximize.svg" />
      </div>
      <div class="Button" @click="btnWinClose">
        <img src="/icon/close.svg" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.winTitle {
  padding: 0 16px;
}

.Logo {
  display: flex;
  align-items: center;
}

.Logo .icon {
  height: 90px;
  user-select: none;
  -webkit-user-drag: none
}

.Logo .title {
  margin: 8px 0 0 6px;
  height: 26px;
  mix-blend-mode: difference;
  -webkit-user-drag: none
}

.WinTitleControl {
  flex: 1;
  height: 100%;
  -webkit-app-region: drag;
}

.Control {
  display: flex;
  -webkit-app-region: drag;
}

.Button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: all 0.3s;
  -webkit-app-region: none;
}

.Button:hover {
  background: var(--buttonHover-color);
}

.Button:active {
  border-radius: 8px;
  background: var(--buttonActive-color);
  transform: scale(0.8);
}

.Button img {
  height: 12px
}
</style>

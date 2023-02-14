<script setup>
import {
  ref,
  reactive,
  onMounted,
  watch,
  nextTick,
  onUpdated,
  computed,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Preview from './Preview.vue';

const ipcRenderer = window.electron.ipcRenderer;

const router = useRouter();
const route = useRoute();

const emit = defineEmits(['addNote', 'saveNote', 'removeNote']);

const list = ref();
const phantom = ref();
const content = ref();
const items = ref();
const height = ref('100%');
const screenHeight = ref(0);
const start = ref(0);
const end = ref(0);
const estimatedItemSize = ref(105);
const previewId = ref(null)
const previewTop = ref(null)
let positions = reactive([
  {
    top: 0,
    bottom: 105,
    height: 105,
  },
]);
const files = reactive({
  search: '',
  current: route.query.id || '',
  list: [],
});
const menus = reactive({
  value: {},
  state: false,
  list: [],
});

const debounce = (fn, delay) => {
  let timer;
  return function (...argu) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, argu)
    }, delay);
  };
};

const GetList = async () => {
  const res = await ipcRenderer.sendSync('getNoteList', files.search)
  if (res) files.list = res
  initPositions();
  updateHeight();
};
GetList();
const searchList = debounce(GetList, 500);

//item点击跳转
const itemClick = (e) => {
  const id = e.currentTarget.dataset.id || '';
  router.push('?id=' + id);
};
//item移入预览
const itemMouseEnter = (e) => {
  previewTop.value = e.clientY >= window.innerHeight - 240
    ? window.innerHeight - 280
    : e.clientY - e.offsetY - 80
  previewId.value = e.currentTarget.dataset.id
}
//item移出预览
const itemMouseLeave = (e) => {
  previewId.value = null
}
//导入
const importNotes = (element) => {
  console.log(element.value);
}
//右键菜单设置
const MenuRightClick = (e) => {
  menus.state = false;
  menus.list = [];

  const noteType = e.currentTarget.dataset.type;
  const noteId = e.currentTarget.dataset.id || '';

  const menu = [
    {
      label: '新建笔记',
      icon: 'new_menu.svg',
      tip: 'Ctrl + N',
      divided: true,
      allow: ['fileItem', 'fileList'],
      click: () => {
        emit('addNote');
      },
    },
    {
      label: '保存',
      icon: 'save_menu.svg',
      tip: 'Ctrl + S',
      allow: ['fileItem', 'id'],
      click: () => {
        emit('saveNote', noteId);
      },
    },
    {
      label: '导入',
      icon: 'import_menu.svg',
      tip: '',
      allow: ['fileItem', 'fileList'],
      click: async () => {
        const res = await ipcRenderer.sendSync('importNote')
        if (res) {
          GetList();
          router.push('?id=' + res.lastInsertRowid)
        };
      },
    },
    {
      label: '打开',
      icon: 'open_menu.svg',
      allow: ['fileItem'],
      click: () => {
        router.push('?id=' + noteId);
      },
    },
    {
      label: '关闭笔记',
      icon: 'close_menu.svg',
      allow: ['fileItem', 'id'],
      click: () => {
        router.push('/');
      },
    },
    {
      label: '删除',
      icon: 'delete_menu.svg',
      divided: true,
      allow: ['fileItem'],
      click: () => {
        emit('removeNote', noteId);
      },
    },
    {
      label: '刷新',
      icon: 'refresh_menu.svg',
      tip: 'Ctrl + R',
      allow: ['fileItem', 'fileList'],
      click: () => {
        GetList();
      },
    },
  ];
  menu.forEach((element) => {
    if (element.allow.indexOf(noteType) > -1)
      if (element.allow.indexOf('id') === -1 || noteId === files.current) menus.list.push(element);
  });

  nextTick(() => {
    menus.value = e;
    menus.state = true;
  });
  e.preventDefault();
  e.stopPropagation();
};

const clearInput = () => {
  files.search = '';
  GetList();
}

//展示数量
const visibleCount = computed(() => {
  return Math.ceil(screenHeight.value / estimatedItemSize.value);
});
//展示数据
const visibleData = computed(() => {
  return files.list.slice(start.value, end.value);
});
//初始化数据
const initPositions = () => {
  positions = files.list.map((d, index) => ({
    index,
    height: estimatedItemSize.value,
    top: index * estimatedItemSize.value,
    bottom: (index + 1) * estimatedItemSize.value,
  }));
};
//二分法
const binarySearch = (list, value) => {
  let start = 0;
  let end = list.length - 1;
  let tempIndex = null;

  while (start <= end) {
    let midIndex = parseInt((start + end) / 2);
    let midValue = list[midIndex].bottom;
    if (midValue === value) {
      return midIndex + 1;
    } else if (midValue < value) {
      start = midIndex + 1;
    } else if (midValue > value) {
      if (tempIndex === null || tempIndex > midIndex) {
        tempIndex = midIndex;
      }
      end = end - 1;
    }
  }
  return tempIndex;
};
//获取列表起始索引
const getStartIndex = (scrollTop = 0) => {
  return binarySearch(positions, scrollTop);
};
//设置偏移量
const setStartOffset = () => {
  const startOffset = start.value >= 1 ? positions[start.value - 1].bottom : 0;
  content.value.style.transform = `translate3d(0,${startOffset}px,0)`;
};
//更新尺寸
const updateItemsSize = () => {
  const nodes = items.value;
  nodes.forEach((node, index) => {
    const { height } = node.getBoundingClientRect();
    const oldHeight = positions[index].height;
    const dValue = oldHeight - height;
    if (dValue) {
      positions[index].bottom = positions[index].bottom - dValue;
      positions[index].height = height;
      for (let k = index + 1; k < positions.length; k++) {
        positions[k].top = positions[k - 1].bottom;
        positions[k].bottom = positions[k].bottom - dValue;
      }
    }
  });
};
//更新列表
const updateHeight = () => {
  screenHeight.value = list.value.clientHeight;
  end.value = start.value + visibleCount.value;
};
//滚动事件
const scrollEvent = () => {
  const scrollTop = list.value.scrollTop;
  start.value = getStartIndex(scrollTop);
  end.value = start.value + visibleCount.value;
  setStartOffset();
};

defineExpose({
  GetList,
});

watch(
  () => router.currentRoute.value.path,
  () => {
    files.current = router.currentRoute.value.query.id || '';
  },
  { deep: true }
);

onMounted(() => {
  window.addEventListener('resize', updateHeight());
});
onUpdated(() => {
  nextTick(() => {
    if (!items.value || !items.value.length) return;
    updateItemsSize();
    let height = positions[positions.length - 1].bottom;
    phantom.value.style.height = height + 'px';
    setStartOffset();
  });
});
</script>

<template>
  <div class="fileListArea">
    <transition name="pre">
      <Preview class="previewBox" v-show="previewId" :previewId="previewId" :style="{ top: previewTop + 'px' }" />
    </transition>
    <div class="searchBox">
      <input type="text" v-model="files.search" placeholder="搜索笔记" @input="searchList" />
      <img src="/icon/close_input.svg" alt="" v-show="files.search" @click="clearInput">
    </div>
    <div ref="list" class="itemList" data-type="fileList" :style="{ height }" @scroll="scrollEvent"
      @contextmenu="MenuRightClick">
      <div v-if="files.list.length === 0" class="fileEmpty">
        <img src="/icon/empty.svg" />
      </div>
      <div ref="phantom" class="itemCard-phantom"></div>
      <div ref="content" class="itemCard-content">
        <div ref="items" class="itemCard" v-for="item in visibleData" :data-id="item.id" data-type="fileItem"
          @contextmenu="MenuRightClick" :key="item.id">
          <div class="item" :class="item.id == files.current ? 'item_active' : ''" :data-id="item.id" @click="itemClick"
            @mouseenter="itemMouseEnter" @mouseleave="itemMouseLeave">
            <div class="itemTitle">
              <img src="/icon/markdown.svg" class="itemTitleIcon" />
              <span>{{ item.title }}</span>
            </div>
            <div class="itemContent">{{ item.content }}</div>
            <div class="itemTime">{{ item.updateDateTime }}</div>
          </div>
        </div>
      </div>
    </div>
    <vue3-menus v-model:open="menus.state" :event="menus.value" :menus="menus.list">
      <template #icon="{ menu }">
        <img :src="'icon/' + menu.icon" class="MenusIcon" />
      </template>
    </vue3-menus>
  </div>
</template>

<style scoped>
.fileListArea {
  position: relative;
  display: flex;
  flex-flow: column;
  width: 100%;
  height: 100%;
  padding-bottom: 15px;
  transition: background 0.3s;
  background: var(--fileList-color);
}

.pre-leave-to {
  opacity: 0;
}

.pre-leave-active {
  transition: opacity .2s;
}

.previewBox {
  z-index: 10;
  position: absolute;
  right: -240px;
  transition: all .15s ease-in;
}

.searchBox {
  position: relative;
  padding: 10px 40px;
  margin: 14px 10px;
  border-radius: 12px;
  transition: all 0.3s;
  background: var(--fileItem-color);
}

.searchBox input {
  height: 24px;
  width: 100%;
  font-size: 15px;
  text-align: center;
  background: unset;
  border: unset;
  transition: all 0.3s;
  color: var(--primary-font-color);
}

.searchBox img {
  position: absolute;
  right: 10px;
}

.searchBox input:focus-visible {
  outline: unset;
}

.fileEmpty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.fileEmpty img {
  width: 70px;
  margin-bottom: 55px;
  opacity: 0.3
}

.itemList {
  position: relative;
  flex: 1;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;
}

.itemList:hover {
  overflow-y: overlay;
}

.itemCard-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.itemCard {
  padding: 0px 10px 15px;
  user-select: none;
}

.itemCard:last-child {
  padding: 0px 10px;
}

.item {
  transition: background 0.3s, box-shadow 0.3s;
  padding: 16px;
  width: calc(100% - 32px);
  background: var(--fileItem-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--fileItem-boxShadow);
}

.item_active {
  background: var(--fileItem-active-color);
}

.itemTitle,
.itemContent {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.itemTitle {
  font-weight: bold;
}

.itemContent {
  font-size: 14px;
  padding-top: 10px;
  color: #707070;
  word-wrap: break-word;
}

.itemTime {
  padding-top: 10px;
  font-size: 14px;
  color: #454545;
}

.itemTitleIcon {
  width: 22px;
  padding-right: 6px
}
</style>

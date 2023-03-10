<script setup>
import { reactive, watch, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import FileList from '../components/FileList.vue';
import Editor from '../components/Editor.vue';
const { ipcRenderer } = window.electron;

const router = useRouter();

const layout = reactive({
  listWidth: '300px',
});
const editor = reactive({
  id: '',
  state: false,
});
const fileListRef = ref();
const editorRef = ref();

const addNote = async () => {
  const res = await ipcRenderer.sendSync('createNote')
  if (res) router.push('?id=' + res.lastInsertRowid);
  getNoteList();
}
const saveNote = async (id) => {
  editorRef.value.SaveNote(id);
};
const removeNote = async (id) => {
  if (editor.id.id == id) editor.state = false;
  const res = await ipcRenderer.send('deleteNote', id)
  await getNoteList();
};
const getNoteList = async () => {
  fileListRef.value.GetList();
};
const splitLineMouseDown = () => {
  document.onselectstart = () => false;
  document.onmousemove = (e) => splitLineMouseMove(e);
  document.onmouseup = () => {
    document.onselectstart = () => true;
    document.onmousemove = document.onmouseup = null;
  };
  return false;
};
const splitLineMouseMove = (e) => {
  const minLocX = 300;
  const maxLocX = document.body.clientWidth * 0.5;
  let listWidth = e.clientX;
  if (listWidth < minLocX) listWidth = minLocX;
  else if (listWidth > maxLocX) listWidth = maxLocX;
  layout.listWidth = listWidth.toString() + 'px';
};

onMounted(() => {
  ipcRenderer.send('app-loaded');
  const id = router.currentRoute.value.query || '';
  if (id.id) {
    editor.id = id;
    editor.state = true;
  }
});

watch(
  () => router.currentRoute.value.path,
  () => {
    const id = router.currentRoute.value.query || '';
    editor.id = id;
    editor.state = false;
    nextTick(() => {
      if (id.id) editor.state = true;
    });
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="main">
    <div class="fileList" :style="{ width: layout.listWidth }">
      <FileList ref="fileListRef" @addNote="addNote" @saveNote="saveNote" @removeNote="removeNote"></FileList>
    </div>
    <div class="splitLine" @mousedown="splitLineMouseDown"></div>
    <div class="editor">
      <Editor v-if="editor.state" ref="editorRef" :noteId="editor.id" @getNoteList="getNoteList" @addNote="addNote">
      </Editor>
      <div v-else class="editorEmpty">
        <img src="/icon/logo.svg" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.main {
  width: 100%;
  height: 100%;
  display: flex;
}

.fileList {
  height: 100%;
}

.splitLine {
  width: var(--splitLine-width);
  height: 100%;
  cursor: col-resize;
}

.splitLine:hover {
  transform: scaleX(3);
}

.editor {
  flex: 1;
  height: 100%;
}

.editorEmpty {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.editorEmpty img {
  height: 50px;
  opacity: 0.05;
  mix-blend-mode: difference;
  user-select: none;
  -webkit-user-drag: none
}
</style>

<script setup>
import { reactive, onMounted, onUnmounted, ref } from 'vue';
import Vditor from 'vditor';
import 'vditor/dist/index.css';
const { ipcRenderer } = window.electron;

const props = defineProps(['noteId']);
const emit = defineEmits(['getNoteList', 'addNote']);

const noteEditor = reactive({
  data: {
    title: '',
    content: '',
  },
  count: 0,
});
const vditor = ref();

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

const GetNoteInfo = async () => {
  const res = await ipcRenderer.sendSync('getNote', props.noteId.id)
  if (res) noteEditor.data = res
};

const SaveNote = async () => {
  const data = {
    id: props.noteId.id,
    title: noteEditor.data.title,
    content: vditor.value.getValue(),
  };
  const res = await ipcRenderer.sendSync('updateNote', data)
  emit('getNoteList');
};

const titleSave = debounce(SaveNote, 500)

const FileToBase64Url = async (fileRaw) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(fileRaw)
    reader.onload = () => {
      resolve(reader.result)
    }
  })
}

//输出pdf，已换成自带导出
// const outputPDF = (html) => { ipcRenderer.send('outputPDF', html.toString()) }

const initEditor = async () => {
  vditor.value = new Vditor('vditor', {
    height: '100%',
    placeholder: '快来写写吧~',
    toolbar: [
      'headings',
      'bold',
      'italic',
      'strike',
      'link',
      '|',
      'list',
      'ordered-list',
      'check',
      'outdent',
      'indent',
      '|',
      'quote',
      'line',
      'code',
      'inline-code',
      'insert-before',
      'insert-after',
      '|',
      'upload',
      'table',
      '|',
      'undo',
      'redo',
      '|',
      'edit-mode',
      'outline',
      'export',
      {
        hotkey: '⌘N',
        name: 'newNote',
        tipPosition: 's',
        tip: '新建笔记',
        className: 'newNote',
        click() {
          emit('addNote');
        },
      },
      {
        hotkey: '⌘S',
        name: 'saveNote',
        tipPosition: 's',
        tip: '保存笔记',
        className: 'saveNote',
        click() {
          SaveNote();
          // const html = document.getElementsByClassName('vditor-ir')[0]
          // outputPDF(html.innerHTML)
        },
      },
    ],
    counter: {
      enable: true,
      after(length) {
        noteEditor.count = length;
      },
    },
    after: () => {
      vditor.value.setValue(noteEditor.data.content);
    },
    upload: {
      url: '/1',
      linkToImgUrl: '/1',
      accept: 'image/*',
      multiple: false,
      async handler(files) {
        const base64 = await FileToBase64Url(files[0])
        const base64Info = base64.split(',')
        const data = {
          imgName: files[0].name,
          imgBuffer: Buffer.from(base64Info[1], 'base64')
        }
        const res = await ipcRenderer.sendSync('upload', data)
        let text = '';
        if (vditor.value && vditor.value.getCurrentMode() === 'wysiwyg') {
          text += `\n <img alt=${res} src="${res}">`;
        } else {
          text += `\n![${files[0].name.split('.')[0]}](${res})`;
        }
        document.execCommand('insertHTML', false, text);
        SaveNote();
      }
    }
  });
};

defineExpose({
  SaveNote,
});

onMounted(async () => {
  await GetNoteInfo();
  await initEditor();
});
onUnmounted(() => {
  vditor.value.destroy();
  vditor.value = null;
});
</script>

<template>
  <div class="editor">
    <div class="title">
      <input v-model="noteEditor.data.title" @input="titleSave" />
    </div>
    <div class="noteEditor">
      <div id="vditor"></div>
    </div>
    <div class="noteCount">
      <span>字数: {{ noteEditor.count }}</span>
    </div>
  </div>
</template>

<style scoped>
.editor {
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  height: 100% !important;
}

.noteEditor {
  flex: 1;
  height: calc(100% - 88px);
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
}

.title input {
  width: 70%;
  transition: all 0.3s;
  text-align: center;
  background: unset;
  border: unset;
  font-size: 18px;
  font-weight: 900;
  color: var(--primary-font-color);
}

.title input:focus-visible {
  outline: unset;
}

.vditor {
  border: unset;
  border-radius: unset;
}

.vditor-reset:focus-visible {
  outline: unset;
}

:deep(.vditor-toolbar) {
  background-color: unset;
  padding: 0 0 10px 0 !important;
  border-bottom: 0;
  display: flex;
  justify-content: center;
}

:deep(.saveNote) {
  display: none;
}

:deep(.newNote) {
  display: none;
}

:deep(.vditor-tooltipped) {
  color: #b9b9b9;
}

:deep(.vditor-tooltipped svg) {
  mix-blend-mode: difference
}

:deep(.vditor-outline) {
  max-width: 300px;
  background: unset;
  border: unset;
}

:deep(.vditor-outline__title) {
  display: none;
}

:deep(.vditor-reset) {
  overflow-y: overlay !important;
  background-color: unset !important;
  color: var(--primary-font-color);
}

:deep(.vditor-preview) {
  background-color: unset;
}

:deep(.vditor-counter) {
  display: none;
}

.noteCount {
  transition: all 0.3s;
  --padding: 10px;
  width: calc(100% - var(--padding));
  text-align: right;
  padding-right: var(--padding);
  line-height: 20px;
  font-size: 14px;
  color: var(--primary-font-color);
}
</style>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import Vditor from 'vditor';
import 'vditor/dist/index.css';

const noteEditor = reactive({
    data: {
        title: '',
        content: '',
    },
    count: 0,
});
const preVidtor = ref('1');
const preShow = ref(false)

const props = defineProps(['previewId']);

const ipcRenderer = window.electron.ipcRenderer;

const GetNoteInfo = async () => {
    const res = await ipcRenderer.sendSync('getNote', props.previewId)
    if (res) noteEditor.data = res
    if (res?.content) preShow.value = true
};

const initEditor = async () => {
    preVidtor.value = new Vditor('preVidtor', {
        height: '100%',
        toolbarConfig: {
            hide: true
        },
        after: () => {
            preVidtor.value.setValue(noteEditor.data.content);
        },
    });
};


onMounted(async () => {
    await GetNoteInfo();
    await initEditor();
});

watch(
    () => props.previewId,
    async () => {
        await GetNoteInfo()
        await initEditor();
    }
)

</script>

<template>
    <div class="preview" v-show="preShow">
        <div id="preVidtor"></div>
    </div>
</template>

<style scoped>
.preview {
    padding: 10px;
    height: 200px;
    width: 200px;
    border-radius: 6px;
    filter: drop-shadow(var(--fileItem-boxShadow));
    background: var(--fileItem-color);
}

.preview .vditor {
    border: unset;
    border-radius: unset;
    transform: scale(0.5);
    transform-origin: left top;
}

.preview :deep(.vditor-toolbar) {
    background-color: unset;
    border: unset;
}

.preview :deep(.vditor-reset) {
    width: 400px;
    height: 400px !important;
    padding: unset !important;
    background-color: unset !important;
    color: var(--primary-font-color);
}
</style>

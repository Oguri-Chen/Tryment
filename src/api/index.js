import { Get, Post } from '../utils/axios'

export function createNote() {
    return Get("/add");
}
export function getNote({ ...params }) {
    return Post("/get", { ...params });
}
export function getList(search) {
    return Post("/list", { search });
}
export function saveNote({ ...params }) {
    return Post("/save", { ...params });
}
export function delNote(id) {
    return Post("/del", { id });
}

export const api = {
    getNote,
    getList,
    createNote,
    saveNote,
    delNote
};
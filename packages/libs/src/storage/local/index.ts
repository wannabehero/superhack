import { LocalTemplate } from "./types"

const LOCAL_FILE_NAME = 'super_local_storage_3000';

export function store(object: LocalTemplate) {
  const templates = retrieve();
  templates.push(object);
  localStorage.setItem(LOCAL_FILE_NAME, JSON.stringify(templates));
}

export function retrieve(): LocalTemplate[] {
  const value = localStorage.getItem(LOCAL_FILE_NAME);
  if (typeof value === 'string') {
    return JSON.parse(value);
  } else {
    return [];
  }
}
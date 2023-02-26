import { writable } from 'svelte/store' 
import { crud } from '@/helpers/crud' 
import { onClient } from '../helpers/on-client';
import { persist, createLocalStorage } from '@macfja/svelte-persistent-store'


function createTasks() {
    /**
     * Set-up Store
     */
    const _name = "tasks";
    const _default = [
        { id: 1, listId: 1, description: "List 1 - Task A", isDone: false, idx: 0 }, 
        { id: 2, listId: 1, description: "List 1 - Task B", isDone: false, idx: 1 }, 
        { id: 3, listId: 1, description: "List 1 - Task C", isDone: true , idx: 2 },

        { id: 4, listId: 2, description: "List 2 - Task A", isDone: false, idx: 0 }, 
        { id: 5, listId: 2, description: "List 2 - Task B", isDone: false, idx: 1 }, 
        { id: 6, listId: 2, description: "List 2 - Task C", isDone: true , idx: 2 },

        { id: 7, listId: 3, description: "List 3 - Task A", isDone: false, idx: 0 }, 
        { id: 8, listId: 3, description: "List 3 - Task B", isDone: false, idx: 1 }, 
        { id: 9, listId: 3, description: "List 3 - Task C", isDone: true , idx: 2 } 
    ];
    const _storage = createLocalStorage();
    const _store = writable(_default); 

    /**
     * Create Store
     */
    let store = persist(_store, _storage, _name);
    
    return { ...crud(store) };
}

export let tasks = null;

onClient(() => {
    tasks = createTasks();
});
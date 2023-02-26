import { writable } from 'svelte/store' 
import { crud } from '@/helpers/crud' 
import { onClient } from '../helpers/on-client';
import { persist, createLocalStorage } from '@macfja/svelte-persistent-store'


function createLists() {
    /**
     * Set-up Store
     */
    const _name = "lists";
    const _default = [
        { id: 1, name: "List A", idx: 0 }, 
        { id: 2, name: "List B", idx: 1 }, 
        { id: 3, name: "List C", idx: 2 }
    ];
    const _storage = createLocalStorage();
    const _store = writable(_default); 

    /**
     * Create Store
     */
    let store = persist(_store, _storage, _name);
    
    return { ...crud(store) };
}

export let lists = null;

onClient(() => {
    lists = createLists();
});
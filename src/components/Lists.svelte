<script>
    import { onClient } from "../helpers/on-client";
    import List from "./List.svelte";
    import { dndzone } from "svelte-dnd-action";
    import { flip } from 'svelte/animate';
    import { createEventDispatcher } from "svelte";
    import { Input } from '@svelteuidev/core';
    import Icon from '@iconify/svelte';

    export let targetListId;

    let lists; 
    let listItems; 
    let dragSourceIdx = -1; 
    let dragSourceId  = -1;
    let dragFinalIdx  = -1; 
    let isListReady = false;
    let addListText = "";

    const dispatch = createEventDispatcher();

    async function fetchLists(keep = false) {
        isListReady = keep;
        lists = (await import("@/stores/lists")).lists;
        listItems = await lists.all();
        listItems = listItems.sort((a, b) => a.idx - b.idx);
        isListReady = true;
    }

    onClient(async () => {
        await fetchLists();
    });

    function onConsider(e) {
        listItems = e.detail.items;
    }

    async function onFinalize(e) {
        await lists.reorder(
            dragSourceIdx, dragFinalIdx, dragSourceId, 
            (item) => {
                return true
            }
        );
        listItems = e.detail.items
    }

    async function transformDraggedElement(e, data, idx) {
        dragSourceIdx = data.idx; 
        dragSourceId = data.id;
        dragFinalIdx = idx;
    }

    async function deleteItem(event, index) {
        listItems = 
            listItems.filter((item) => item.id != event.detail.id);
        dispatch('delete-list', { id: event.detail.id, index })
    }


    async function doAddList() {
        if(addListText == "") return;
        await onClient(async () => {
            const lists = (await import("@/stores/lists")).lists; 
            await lists.create({
                name: addListText, 
                idx: listItems.length
            });
            addListText = "";
        });
        await fetchLists(true); 
    }

    async function handleNewTaskKeyUp(e) {
        if(e.key == "Enter") {
            await doAddList();
        }
    }


</script> 

<div class="lists">
    <div class="controls">
        <div class="new-task-input-container">
            <Input 
                class="new-task-input"
                type="text" 
                bind:value={addListText}
                on:keyup={handleNewTaskKeyUp}
                style="
                    font-size: 20px; 
                    outline: none;
                " />
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div 
            class="add-task-button-container"
            on:click={doAddList}
        > 
            <Icon 
                class="add-task-button"
                icon="material-symbols:add-box-rounded" 
                height="35"   
            />
        </div>
    </div>
    {#if listItems && isListReady}
        {#if listItems.length > 0}
            <div    
                class="list-items" 
                use:dndzone={{
                    items: listItems, 
                    duration: 300, 
                    dropTargetStyle: {},
                    transformDraggedElement
                }}
                on:consider={onConsider}
                on:finalize={onFinalize} > 
                {#each listItems as list, index (list.id) }
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div 
                        class="list-item-container"
                        animate:flip={{duration: 300}}
                        class:active={targetListId == list.id}
                    >
                        <List 
                            {list} {index} 
                            on:delete-item={(e) => deleteItem(e, index)} 
                            on:select-list={() => dispatch('change-list', { id: list.id } )}
                        />
                    </div>
                {/each}
            </div>
        {:else} 
            <div class="no-tasks"> 
                No Lists at the Moment
            </div> 
        {/if}
    {/if}
</div>

<style lang="scss">

    .controls {
        margin: 20px;
        display: flex; 
        flex-direction: row;
    }

    .list-items {
        margin: 20px;
        display: flex;
        flex-direction: column; 
        gap: 5px;
        max-height: calc(100vh - 150px - 120px);
        overflow-y: scroll;
        padding: 5px;

        .list-item-container.active :global(.list-item) {
            background-color: rgb(200, 200, 200);
        }
    }

    .no-tasks {
        color: grey;
        padding: 20px;
        border: 2px solid grey;
        border-radius: 5px; 
        margin: 20px;
    }
</style>
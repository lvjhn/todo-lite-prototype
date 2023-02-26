<script> 
    import TaskItem from "./TaskItem.svelte";
    import { Input } from '@svelteuidev/core';
    import Icon from '@iconify/svelte';
    import { onClient } from '@/helpers/on-client';
    import { dndzone } from "svelte-dnd-action";
    import { flip } from 'svelte/animate';

    let tasks;
    let listTasks;

    export let targetListId; 

    let addTaskText = "";

    let dragSourceIdx = -1; 
    let dragSourceId  = -1;
    let dragFinalIdx  = -1; 
    let isListReady = false;

    $: targetListId && (async () => await fetchTasks())();  

    async function fetchTasks(keep = false) {
        isListReady = keep;
        tasks = (await import("@/stores/tasks")).tasks;
        listTasks = await tasks.search((item) => item.listId == targetListId);
        listTasks = listTasks.sort((a, b) => a.idx - b.idx);
        isListReady = true;
    }

    onClient(async () => {
        await fetchTasks();
    });

    function onConsider(e) {
        listTasks = e.detail.items;
    }

    async function onFinalize(e) {
        await tasks.reorder(
            dragSourceIdx, dragFinalIdx, dragSourceId, 
            (item) => {
                return item.listId == targetListId
            }
        );
        listTasks = e.detail.items
    }

    async function transformDraggedElement(e, data, idx) {
        dragSourceIdx = data.idx; 
        dragSourceId = data.id;
        dragFinalIdx = idx;
    }

    async function doAddTask() {
        if(addTaskText == "") return;
        await onClient(async () => {
            const tasks = (await import("@/stores/tasks")).tasks; 
            await tasks.create({
                description: addTaskText, 
                isDone: false,
                listId: targetListId,
                idx: listTasks.length
            });
            addTaskText = "";
        });
        await fetchTasks(true); 
    }

    async function handleNewTaskKeyUp(e) {
        if(e.key == "Enter") {
            await doAddTask();
        }
    }

    async function deleteItem(event) {
        console.log(event);
        listTasks = 
            listTasks.filter((item) => item.id != event.detail.id);
    }

</script> 

<div class="task-list"> 
    <div class="controls">
        <div class="new-task-input-container">
            <Input 
                class="new-task-input"
                type="text" 
                bind:value={addTaskText}
                on:keyup={handleNewTaskKeyUp}
                style="
                    font-size: 20px; 
                    outline: none;
                " />
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div 
            class="add-task-button-container"
            on:click={doAddTask}
        > 
            <Icon 
                class="add-task-button"
                icon="material-symbols:add-box-rounded" 
                height="35"   
            />
        </div>
    </div>
    {#if listTasks && isListReady}
        {#if listTasks.length > 0}
            <div    
                class="items" 
                use:dndzone={{
                    items: listTasks, 
                    duration: 300, 
                    dropTargetStyle: {},
                    transformDraggedElement
                }}
                on:consider={onConsider}
                on:finalize={onFinalize} > 
                {#each listTasks as task, index (task.id) }
                    <div animate:flip={{duration: 300}}>
                        <TaskItem {task} {index} on:delete-item={deleteItem} />
                    </div>
                {/each}
            </div>
        {:else} 
            <div class="no-tasks"> 
                No Tasks at the Moment
            </div> 
        {/if}
    {/if}
</div>

<style lang="scss"> 
    .task-list {
        background-color: rgb(234, 234, 234);
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0px 0px 2px grey;
        max-height: calc(100vh - 50px);
        min-height: calc(100vh - 150px);

        .controls {
            display: flex; 
            gap: 5px;

            .new-task-input-container {
                flex-grow: 1;
            }

            .add-task-button-container:hover {
                opacity: 0.8;
                cursor: pointer;
            }

            .add-task-button-container:active {
                opacity: 0.5;
            }
        }

        .items {
            margin-top: 10px;
            display: flex; 
            gap: 5px; 
            flex-direction: column;
            height: calc(100vh - 150px - 50px);
            overflow-y: scroll;
            padding: 5px;
        }

        .no-tasks {
            text-align: center;
            padding: 30px;
            color: grey;
            font-weight: bold; 
            border-radius: 5px; 
            margin-top: 10px;
            box-shadow: 0px 0px 2px grey;
        }
    }
</style>
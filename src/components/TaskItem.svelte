<script> 
    import { Checkbox, Button, Modal, Input } from '@svelteuidev/core'
    import Icon from '@iconify/svelte'
    import { onClient } from '@/helpers/on-client'
    import { createEventDispatcher } from 'svelte';

    export let task; 
    export let index; 

    let dispatch = createEventDispatcher();

    let isActionOptionsShown = false;
    let isDeleteConfirmShown = false; 
    let isEditingTask = false;
    let editTaskText = task.description;

    function toggleShowActionOptions() {
        isActionOptionsShown = !isActionOptionsShown;
    }

    function editTask() {
        isEditingTask = true;
        isActionOptionsShown = false;
    }

    async function handleIsDone() {
        await onClient(async () => {
            const tasks = (await import("@/stores/tasks")).tasks; 
            await tasks.patch(
                (item) => item.id == task.id, 
                (item) => {
                    item.isDone = task.isDone
                }
            );
        });
    }

    function deleteTask() {
        isDeleteConfirmShown = true;
        isActionOptionsShown = false;
    }

    function closeDeleteConfirmModal() {
        isDeleteConfirmShown = false;
    }

    async function doDeleteTask() {
        await onClient(async () => {
            const tasks = (await import("@/stores/tasks")).tasks; 
            await tasks.remove((item) => item.id == task.id);
            isDeleteConfirmShown = false;
            dispatch('delete-item', { id: task.id });
        });
    }

    async function doChangeDescription() {
        await onClient(async () => {
            const tasks = (await import("@/stores/tasks")).tasks; 
            await tasks.patch(
                (item) => item.id == task.id, 
                (item) => {
                    item.description = editTaskText;
                }
            )
            isEditingTask = false;
        });
    }

    async function handleChangeDescriptionKeyUp(e) {
        if(e.key == "Enter") {
            await doChangeDescription();
        }
    }

</script> 

<div class="task-item">
    {#if !isEditingTask}
        <div class="is-done-checkbox">
            <Checkbox bind:checked={task.isDone} on:change={handleIsDone} />
        </div> 
    {/if}
        
    <div class="description">
        {#if !isEditingTask}
            <div class="task-description-label" class:is-done={task.isDone}> 
                {task.description} {index}
            </div>
        {:else} 
            <div class="edit-task-description"> 
                <Input 
                    style="
                        font-size: 20px;
                        outline: none;
                    "
                    on:keyup={handleChangeDescriptionKeyUp}
                    bind:value={editTaskText}
                /> 
            </div> 
        {/if}
    </div> 

    {#if isEditingTask}
        <div class="change-description"> 
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div 
                class="change-description-icon"
                on:click={doChangeDescription}    
            >
                <Icon 
                    icon="material-symbols:check-circle-outline-rounded" 
                    style="
                        font-size: 30px;
                        padding-top: 3px;
                    "
                />
            </div>
        </div> 
    {/if}

    {#if !isEditingTask}
        <div class="actions"> 
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div 
                class="action-icon"
                on:click={toggleShowActionOptions}
            >
                <Icon 
                    icon="mdi:ellipsis-horizontal" 
                    style="
                        font-size: 20px;
                    "/>
            </div>

            {#if isActionOptionsShown}
                <div class="action-options"> 
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div 
                        class="action-item"
                        on:click={editTask}
                    > 
                        <div class="action-icon">
                            <Icon icon="mdi:pencil-outline" />
                        </div> 
                        <div class="action-label">
                            <td>Edit</td> 
                        </div> 
                    </div>  
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div 
                        class="action-item"
                        on:click={deleteTask}
                    > 
                        <div class="action-icon">
                            <Icon icon="mdi:trash-can" 
                            />
                        </div> 
                        <div class="action-label">
                            <td>Delete</td> 
                        </div> 
                    </div> 
                </div> 
            {/if}
        </div> 
    {/if}

    <Modal 
        title="Confirm deletion?" 
        class="confirm-delete-modal"
        bind:opened={isDeleteConfirmShown}
        on:close={closeDeleteConfirmModal}> 
        <b>Task to delete:</b> <i>{task.description}</i>
        <br /><br />
        <div class="warning"> 
            This action cannot be undone! 
        </div>
        <div class="options"> 
            <div class="delete"> 
                <Button 
                    on:click={doDeleteTask}
                    color="red">
                    Yes, delete.
                </Button>
            </div> 
            <div class="abort"> 
                <Button on:click={closeDeleteConfirmModal}>
                    No, abort.
                </Button>
            </div> 
        </div> 
    </Modal>
</div>

<style lang="scss"> 
    .task-item {
        background-color: rgb(245, 245, 245);
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0px 0px 2px grey;
        display: flex; 
        gap: 10px;

        .description {
            font-size: 18px;
            padding-top: 2px;
            flex-grow: 1;
        }

        .description {
            .task-description-label.is-done  {
                text-decoration: line-through;
                color: grey;
                font-style: italic;
            }

        }

        .actions {
            padding-top: 2px;

            .action-options {
                position: absolute;
                margin-left: -70px;
                background-color: white;
                width: 80px;
                padding: 10px;
                box-shadow: 0px 0px 2px grey;
                border-radius: 5px;
                display: flex; 
                flex-direction: column; 
                gap: 5px;
            }

            .action-item {
                display: flex;
                gap: 5px;
                font-weight: bold;
                cursor: pointer;
            }

            .action-item:hover {
                color: rgb(50, 70, 80);
            }

            .action-item:active {
                color: grey;
            }

            .action-icon:hover {
                opacity: 0.8;
                cursor: pointer;
            }

            .action-icon:active {
                opacity: 0.5;
            }
        }

        .change-description {
            color: rgb(6, 155, 105);
        }

        .change-description:hover {
            opacity: 0.8;
            cursor: pointer;
        }

        .change-description:active {
            opacity: 0.5;
        }

    }

    :global(.confirm-delete-modal) {
        .options {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }
    }
    
</style>
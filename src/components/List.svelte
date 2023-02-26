<script> 
    import Icon from '@iconify/svelte'
    import { Modal, Button, Input } from '@svelteuidev/core'
    import { onClient } from '@/helpers/on-client.js'
    import { createEventDispatcher } from 'svelte';

    export let list;
    export let index;

    let dispatch = createEventDispatcher();

    let isActionOptionsShown = false;
    let isDeleteConfirmShown = false;
    let isEditingList = false;
    let editListText = list.name;

    function toggleShowActionOptions() {
        isActionOptionsShown = !isActionOptionsShown;
    }

    async function deleteList() {
        isDeleteConfirmShown = true;
        isActionOptionsShown = false;
    }

    function editList() {
        isEditingList = true;
        isActionOptionsShown = false;
    }

    async function closeDeleteConfirmModal() {
        isDeleteConfirmShown = false;
    }

    async function doDeleteList() {
        await onClient(async () => {    
            const lists = (await import("@/stores/lists")).lists; 
            await lists.remove((item) => item.id == list.id);
            isDeleteConfirmShown = false;
            dispatch('delete-item', { id: list.id });
        });
    }

    async function doChangeName() {
        await onClient(async () => {
            const tasks = (await import("@/stores/lists")).lists; 
            await tasks.patch(
                (item) => item.id == list.id, 
                (item) => {
                    item.name = editListText;
                }
            )
            isEditingList = false;
        });
    }

    async function handleChangeDescriptionKeyUp(e) {
        if(e.key == "Enter") {
            await doChangeName();
        }
    }

</script> 

<div class="list-item">
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div 
        class="name"
        on:click={() => dispatch('select-list', { id: list.id })}
    >
        {#if !isEditingList}
                <div 
                class="task-description-label" 
            > 
                {list.name} 
            </div>
        {:else} 
            <div class="edit-task-description"> 
                <Input 
                    style="
                        font-size: 16px;
                        outline: none;
                        margin-top: -5px;
                    "
                    on:keyup={handleChangeDescriptionKeyUp}
                    bind:value={editListText}
                /> 
            </div> 
        {/if}
    </div> 

    {#if isEditingList}
        <div class="change-description"> 
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div 
                class="change-description-icon"
                on:click={doChangeName}    
            >
                <Icon 
                    icon="material-symbols:check-circle-outline-rounded" 
                    style="
                        font-size: 22px;
                        padding-top: 0px;
                    "
                />
            </div>
        </div> 
    {/if}

    {#if !isEditingList}
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
                        on:click={editList}
                    > 
                        <div 
                            class="action-icon"
                        >
                            <Icon icon="mdi:pencil-outline" />
                        </div> 
                        <div class="action-label">
                            <td>Edit</td> 
                        </div> 
                    </div>  
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div 
                        class="action-item"
                        on:click={deleteList}
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
        <b>List to delete:</b> <i>{list.name}</i>
        <br /><br />
        <div class="warning"> 
            This action cannot be undone! 
        </div>
        <div class="options"> 
            <div class="delete"> 
                <Button 
                    on:click={doDeleteList}
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
    .list-item {
        background-color: rgb(250, 250, 250); 
        box-shadow: 0px 0px 2px grey;
        padding: 5px;
        border-radius: 2px;
        text-align: left;
        display: flex;
        flex-direction: row;
        padding-top: 12px;
        padding-left: 10px;
        gap: 5px;

        .name {
            flex-grow: 1;
        }

        .actions {
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
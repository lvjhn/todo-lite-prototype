<script>
    import TaskList from '../components/TaskList.svelte';
    import { onClient } from '@/helpers/on-client'     
    import { onMount } from 'svelte'
    import { Svroller } from 'svrollbar'
    import Lists from '../components/Lists.svelte';
    import { Button } from '@svelteuidev/core'

    let loaded = false; 

    let root;

    let activeListId = -1;
    let activeList;
    let lists;

    $: activeListId && (async () => await updateActiveList())(); 

    onMount(() => {
        loaded = true;
    })

    async function updateActiveList() {
        if(lists) 
            activeList =
                (await lists.all()).filter((item) => item.id == activeListId)[0]; 
        else    
            activeList = null;
    }

    function changeList(event) {
        activeListId = event.detail.id;
    }

    async function selectFirstList() {
        if((await lists.all()).length > 0)
            activeListId = (await lists.all())[0].id;
        else 
            activeListId = -1;
    }

    async function fetchLists() {
        lists = (await import("@/stores/lists")).lists;
        await selectFirstList();
    }

    async function handleDeletedList(event) {
        if(event.detail.index == 0) {
            await selectFirstList();
        }
        else {
            activeListId = -1;
            activeList = null;
        }
    }

    function clearData() {
        localStorage.clear();
        location.reload(); 
    }

    onClient(async () => {
        await fetchLists();
        await selectFirstList();
    });
    


</script> 

<div class="home">  
    {#if loaded}    
        <div class="sidebar"> 
            <div class="app-title">
                <h1>Todo-Lite</h1>
            </div>
            <div class="lists">
                <Lists 
                    bind:targetListId={activeListId}
                    on:change-list={changeList} 
                    on:delete-list={handleDeletedList}
                />
                <div align="center">
                    <Button on:click={clearData}>
                        CLEAR DATA
                    </Button>
                </div>
            </div> 
        </div>
        {#if activeList}
            <div class="main-panel">
                <div class="task-list-title"> 
                    <h3>{activeList.name}</h3> 
                </div> 
                <div class="task-list-content">
                    <TaskList 
                        bind:targetListId={activeListId} 
                    />
                </div>
            </div>
        {:else} 
            <div class="main-panel no-list-selected">
                <div class="content">
                    Please select a list first to continue... 
                </div>
            </div>
        {/if}
    {:else} 
        <div class="loading"> 
            <div class="loading-text"> 
                Loading app...
            </div> 
        </div> 
    {/if}
</div>

<style lang="scss"> 
    .home {
        position: fixed;
        top: 0px; 
        left: 0px;
        display: flex;
        height: 100%;
        width: 100%;

        .sidebar {
            width: 300px; 
            background-color: rgb(234, 234, 234);
            box-shadow: 0px 0px 2px grey;

            .app-title {
                text-align: center;
            } 

            .lists {
                text-align: center;
            }
        }

        .main-panel {
            background-color: rgb(250, 250, 250);
            flex-grow: 1;
            padding: 0px 20px;
            display: flex;
            flex-direction: column;

            .task-list-title {
                font-size: 20px;
                height: 70px;
                padding-left: 5px;
                
                h3 {
                    margin: 20px 0px; 
                    padding: 0px;
                }
            }

            .task-list-content {
                flex-grow: 1;
                margin-bottom: 20px;
                border-radius: 5px;
            }
        }


        .loading {
            display: flex; 
            justify-content: center;
            align-items: center;
            width: 100%; 
            height: 100%;
        } 

        .main-panel.no-list-selected {
            display: flex; 
            align-items: center;
            justify-content: center;
            color: grey;
        }
    }
</style>
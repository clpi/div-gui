<script lang="ts">
  import { getAllUsers } from '../util/calls';
  import Btn from '../comp/ui/btn.svelte';
  import Nav from '../comp/ui/nav.svelte';

  let userPromise = Promise.resolve([]);
  let submittedUsers: boolean = false;
  async function getUsers(): Promise<JSON> {
    submittedUsers = true;
    const res = await getAllUsers()
      .catch(err=>{
      console.log(err);
        return [];
    });
    userPromise = res;
    return res;
  }
</script>

<style>
  .user-card {
    background: #2a2a2a;
    margin: 20px 10px 20px 10px;
    border: 1px solid #fc9;
    border-radius: 4px;
    box-shadow: 2px 2px 2px #000;
    width: 50vw;
    display: block;
    margin: auto;
    margin-bottom: 30px;
    margin-top: 30px;
  }
  .user-card li {
    list-style: none;
  }
  h3 {
    font-size: 1.5rem;
  }
</style>

<Nav/>
<Btn btn="filled" on:click={getUsers}>Fetch</Btn>

  {#await userPromise}
    <p>Getting users...</p>
  {:then users}
    {#if submittedUsers}
      {#each users as user}
      <div class="user-card">
        <ul>
          <h3>{user.username}</h3>
          <li><p>{user.id}</p></li>
          <li><p>{user.username}</p></li>
          <li><p>{user.email}</p></li>
          <li><p>{user.createdAt}</p></li>
        </ul>
      </div>
      {/each}

    {/if}

  {:catch err}
    <p>{ err } - Something happened. Couldn't get users</p>
  {/await}

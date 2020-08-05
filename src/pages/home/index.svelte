<script lang="ts">
  import * as dialog from 'tauri/api/dialog';
  import Nav from '../../comp/ui/nav.svelte';
  import { user, isLoggedIn } from '../../util/store.js';
  import { emit, listen } from 'tauri/api/event';
  import { setTitle } from 'tauri/api/window';
  import Btn from '../../comp/ui/btn.svelte';
  import Menu from '../../comp/ui/menubar.svelte';
  import { beforeUrlChange, goto, isActive, url } from '@sveltech/routify';
  import Switch from '../../comp/ui/switch.svelte';
  import { onMount } from 'svelte';
  let showNav = false;
  const toggleNav = () => {
    showNav = !showNav; 
  }
  /*onMount(() => {*/
    /*if(!$isLoggedIn) {*/
      /*alert("Not logged in! Taking you back to login.")*/
      /*$goto('/index')*/
    /*}*/
  /*})*/
  /*$beforeUrlChange(() => {*/
    /*if($isLoggedIn) {*/
      /*return true*/
    /*} else {*/
      /*$goto('/index');*/
      /*return true*/
    /*}*/
  /*})*/
</script>
<style>
  h3 {
    padding: 30px 5px 30px 5px;
  }
  h3 {
    padding: 20px 5px 20px 5px;
  }
  .home {
    display: block;
    white-space: pre-line;
  }
  .btns {
    display: inline;
  }
  .welcome {
    font-size: 4rem;
    font-weight: 300;
    text-shadow: 0.5px 1.5px 2.5px #000;
  }
</style>

{#if showNav}
<Nav/>
{/if}
<Menu/>
<Nav/>
<div class="home">
  <br/><br/>
  <div class="rec">
    <h3>Your Records</h3>
    <a href={$url('/rec/new')}>
    <Btn btn="raised">New</Btn>
    </a>
    <a href={$url('/rec')}>
    <Btn btn="raised">Open</Btn>
    </a>
      <br/><br/>
    <p><em>Records here...</em></p>
  </div>
  <div class="item">
    <h3>Your Items</h3>
    <Btn btn="raised" on:click={() => {$goto('/item/new')}}>New</Btn>
    <Btn btn="raised">Open</Btn>
      <br/><br/>
    <p><em>Items here...</em></p>
  </div>
  <div class="rule">
    <h3>Your Rules</h3>
    <Btn btn="raised square">New</Btn>
    <Btn btn="raised square">Open</Btn>
      <br/><br/>
    <p><em>Rules here...</em></p>
  </div>
  <p><a href={$url('/index')}>Back to index</a></p>
  <br/><br/>
  <Switch on:toggle={toggleNav}/>
</div>

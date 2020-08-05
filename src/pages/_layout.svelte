<script lang="ts">
  import Nav from '../comp/ui/nav.svelte';
  import StatusBar from '../comp/ui/statusbar.svelte';
  import { beforeUrlChange } from '@sveltech/routify';
  import { blur } from 'svelte/transition';
  /*import { refreshAuth, getUserById } from '../util/calls.js';*/
  import { user, isLoggedIn } from '../util/store.js';

  $beforeUrlChange(async() => {
    if(isLoggedIn) {
       
    }  
    return true
  })
</script>
<style>
  .layout {
    background-color: #282a2c;
    position: absolute;
    display: block;
    width: 100vw;
    height: 100vh;
    max-height: 100vh;
  }
  .content {
    padding: 5vh 2.5vw 5vh 2.5vw;
  }
</style>
<div class="layout" in:blur>
      <slot/>
</div>
<StatusBar/>

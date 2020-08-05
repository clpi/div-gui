<script lang="ts">
  import Nav from '../comp/ui/nav.svelte';
  import Btn from '../comp/ui/btn.svelte';
</script>
<Nav/>
  <h3>Dash</h3>
  <Btn btn="raised" on:click={() => console.log("f")}>Fetch users</Btn>

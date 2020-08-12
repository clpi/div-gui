<script lang="ts">
  import Nav from '../comp/ui/nav.svelte';
  import Btn from '../comp/ui/btn.svelte';
  import { invoke, promisified } from 'tauri/api/tauri';
  import { open, save } from 'tauri/api/dialog';
  let text = "";
  let parse = () => {
    invoke({ cmd: 'parseText', text: text });
  }
  let openfile = async () => {
    let path = await open()
    .then(path => path.toString())
    .catch(err=>console.error(err));
    let opn = await promisified({ cmd: 'openFile', path: path });
    console.log(opn.toString());
  }
  let savefile = async () => {
    let path = await save()
    .then(res => res.toString())
    .catch(err=>console.error(err));
    let sve = await promisified({ cmd: 'saveFile', path: path, data: text });
    console.log(sve.toString());
  }
  window.addEventListener("open", (data) => {
    console.log("Hello, opened" + data);
  })
  document.addEventListener("open", (data) => {
    console.log("Hello, opened" + data);
  });
  document.addEventListener("save", () => {
    console.log("Hello, saved");
  });
</script>
<style>
  .input {
    margin-top: 20px;
    margin-bottom: 20px;
    color: #eee;
    border-color: #fc9;
    font-size: 1.3rem;
    padding: 40px;
    width: 90vw;
    height: 50vh;
    background: #222;
  }
</style>
<Nav/>
  <h3>Dash</h3>
  <textarea class="input" bind:value={text}></textarea>
  <Btn btn="raised" on:click={parse}>Parse</Btn>
  <br/>
  <Btn btn="raised" on:click={openfile}>Open</Btn>
  <Btn btn="raised" on:click={savefile}>Save</Btn>


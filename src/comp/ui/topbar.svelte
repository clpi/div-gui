<script>
  import { isActive, url } from '@sveltech/routify';
  import ChevronCircleUp from 'svelte-icons/fa/FaChevronCircleUp.svelte';
  import FaHome from 'svelte-icons/fa/FaHome.svelte';
  import FaChalkboard from 'svelte-icons/fa/FaChalkboard.svelte';
  import FaUserCog from 'svelte-icons/fa/FaUserCog.svelte';
  import FaPlus from 'svelte-icons/fa/FaPlus.svelte';
  import FaFileImport from 'svelte-icons/fa/FaFileImport.svelte';
  import FaFileExport from 'svelte-icons/fa/FaFileExport.svelte';
  import FaTools from 'svelte-icons/fa/FaTools.svelte';
  import { open, save } from 'tauri/api/dialog';
</script>
<style>
.nav {
  background-color: #1c1f23;
  padding: 1.1vh 0vw 1.1vh 0vw;
  font-size: 1.1rem;
  font-weight: 350;
  overflow: hidden;
  text-align: center;
  width: 100%;
  min-width: 100%;
  height: 7h;
  max-height: 40px;
  margin: 0;
  /*padding: 1.8vh 0vw 1.8vh 0vw;*/
  box-shadow: 0px 2px 1px rgba(0,0,0,0.1);
  border-bottom: 1px solid rgba(180, 180, 185, 0.3);

}
li a {
  display: inline-block;
}
.icn {
  width: 14px;
  height: 14px;
  float: left;
  padding: 3px 7px 5px 7px;
}
.nav ul {
  /*justify-content: center;*/
  display: inline-block;
  margin: auto;
  list-style: none;
  /*margin: 0vh 5vw 0vh 5vw;*/
}

.nav li {
  float: left;
  display: block-inline;
  margin: 0 0.8vw 0 0.8vw;
  /*padding: 8px 1.3vw 8px 1.3vw;*/
  border-bottom: 2px solid rgba(100, 100, 100, 0);
}
.nav li:hover {
  border-bottom: 2px solid rgba(100, 100, 100, 80);
  transition: border-bottom 0.3s;
}

.title {
  margin-right: 5vw;
  font-stretch: ultra-expanded;
  font-size: 1.1rem;
  text-shadow: 2px 2px 2px #000;
  font-weight: 400;
}

.link {
  color: #ffca90;
  font-weight: 380;
  text-shadow: 0px 1px 2px rgba(0,0,0,100);
}
.link:hover {
  color: #df9a50;
}
.right-link {
  float: right;
  text-shadow: 0px 1px 2px rgba(0,0,0,100);
}
.right-link a {
  color: #ffca90;
}
.right-link a:hover {
  color: #df9a50;
}
li {
  height: 100%;
}

</style>
<div class="nav">
<ul>
  <li class:active={$isActive('/index')}>
    <a href={$url('/index')}>
      <div class="icn">
        <FaHome/>
      </div>
      Home
    </a>
  </li>
  <li class:active={$isActive('/dash')}>
    <a href={$url('/dash')}>
      Dash
      <div class="icn">
        <FaChalkboard/>
      </div>
    </a>
  </li>
  <li class="link">
    <a href="#">
      New
      <div class="icn">
        <FaPlus/>
      </div>
    </a>
  </li>
  <li class="link">
    <a href="#">
      Tools
      <div class="icn">
        <FaTools/>
      </div>
    </a>
  </li>
  <li class:active={$isActive('/preferences')}>
    <a href={$url('/preferences')}>
      Prefs
      <div class="icn">
        <FaUserCog/>
      </div>
    </a>
  </li>
  <li class="right-link" class:active={$isActive('/profile')}>
    <a href={$url('/profile')}>
      You
      <div class="icn">
        <ChevronCircleUp/>
      </div>
    </a>
  </li>
  <li class="right-link" on:click={open}>
    <a href={$url('/profile')}>
      Open
      <div class="icn">
        <FaFileImport/>
      </div>
    </a>
  </li>
  <li class="right-link" on:click={save}>
    <a href={$url('/profile')}>
      Save
      <div class="icn">
        <FaFileExport/>
      </div>
    </a>
  </li>

</ul>
</div>

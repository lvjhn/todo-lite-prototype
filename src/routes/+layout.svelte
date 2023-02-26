<script>
  import "../app.scss";
  import "../main.js";
  import "../style.scss";

  import { SvelteUIProvider } from '@svelteuidev/core';
</script>

<div class="root">
  <SvelteUIProvider>
    <slot />
  </SvelteUIProvider>
</div>

<style>
  .root {
    width: 100%;
    height: 100%;
  }
</style>

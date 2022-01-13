<script>
  export let type = "button";
  export let caption;
  export let href = null;
  export let mode = null;
  export let color = null;
  export let style = null;
  export let disabled = false;
  export let id=null;
  export let name=null;
  export let margin=null;
  export let accesskey=null;
</script>

<link rel="stylesheet" href="style.css">
{#if href}
  <a class="link" {href}>{caption}</a>
{:else}
  <button class="{mode} {color} {style} {margin}" {type} {id} {name} {disabled} aria-label={caption} {accesskey} tabindex=0 on:click>{caption}</button>
{/if}


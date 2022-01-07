<script>
    export let Heading;
</script>

<link rel="stylesheet" href="style.css">
<div class="nav-bar pos-fixed">
  <div class="img">
    <img src="/images/logo.png" alt="" height="38rem" width="90vw" />
  </div>
  <div class="main-heading pos-fixed" tabindex="0" aria-label={Heading}>
    <h1>{Heading}</h1>
  </div>
</div>

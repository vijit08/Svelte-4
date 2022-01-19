<script>
  import { createEventDispatcher } from "svelte";
  import { attempted, counter, disable1, disable2 } from "../data-store.js";
  import { unattempted } from "../data-store.js";
  import { currentitem } from "../data-store.js";
  import { question } from "../data-store.js";
  import { allques } from "../data-store.js";
  
  var character = String.fromCharCode(65 + 1);
  let allitems = true;
  let Remove_Duplicate;
  var count;
  var Raw_Attempt = [];
  var Raw_Unattempted = [];
  var Raw_Ques = [];
  var final = [];
  var dummy = [];
  var showatt = false;
  var showunatt = false;
  var clicked = false;
  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch("cancel");
    counter.update((its) => {
      return $currentitem;
    });

    if ($counter == 10) {
      disable1.set(true);
    }
  }

  allques.subscribe((its) => {
    let Remove_Duplicate = its.filter((c, index) => {
      return its.indexOf(c) === index;
    });

    Raw_Ques = [...Remove_Duplicate];
  });

  attempted.subscribe((items) => {
    let Remove_Duplicate = items.filter((c, index) => {
      return items.indexOf(c) === index;
    });

    Raw_Attempt = [...Raw_Attempt, ...Remove_Duplicate];
    count = Remove_Duplicate.length;
  });

  for (let items of Raw_Attempt) {
    let Attempt_items = $allques.indexOf(items);
    delete $allques[Attempt_items];
  }

  for (let allitems of $allques) {
    if (allitems != undefined) {
      Raw_Unattempted.push(allitems);
    }
  }

  unattempted.update((its) => {
    return [...Raw_Unattempted];
  });

  unattempted.subscribe((items) => {
    let Duplicate = items.filter((c, index) => {
      return items.indexOf(c) === index;
    });

    final = [...final, ...Duplicate];
  });

  $: Remove_Duplicate = count;
  $: Raw_Unattempted = Raw_Unattempted.length;

  function showattempt() {
    showatt = true;
    showunatt = !showatt;
    allitems = false;
  }

  function showunattempt() {
    showunatt = !showunatt;
    showatt = false;
    allitems = false;
}

  function showitems() {
    allitems = true;
    showatt = false;
    showunatt = false;
}

  function goto(items,event) {
    clicked = true;
    question.subscribe((ies) => {
      var jump_to = ies.indexOf(event);
      currentitem.set(jump_to);
      if ($currentitem == 0) {
        counter.set(0);
        disable2.set(true);
        disable1.set(false);
      }
      else if ($currentitem > 0) {
        disable2.set(false);
        disable1.set(false);
      }
    });
  }

  question.subscribe((item) => {
    for (let y = 0; y < item.length; y++) {
      let items = JSON.parse(item[y].content_text).question;
      dummy.push(items);
    }
  });

  function gotoa(element,event) {
    let Attempt_items = dummy.indexOf(event);
    currentitem.update((its) => {
      return Attempt_items;
    });
    if ($currentitem == 0 || $currentitem == 1) {
      disable2.set(true);
      disable1.set(false);
    }
    else if ($currentitem > 0) {
      disable2.set(false);
      disable1.set(false);
    }
  }
</script>

<link rel="stylesheet" href="style.css" />
<div class="list-backdrop" on:click={closeModal} />
<div class="list">
  <div class="heads">
    <h2 class="sub-heading" tabindex="0" on:click={showitems} accesskey=1 class:change={allitems && !showatt && !showunatt}>
      All Items:{dummy.length}
    </h2>
    <h2 class="sub-heading" tabindex="0" on:click={showattempt} accesskey=2 class:change={!allitems && showatt && !showunatt}>
      Attempted:{Remove_Duplicate}
    </h2>
    <h2 class="sub-heading" on:click={showunattempt} accesskey=3 class:change={!allitems && !showatt && showunatt}>
      UnAttempted:{Raw_Unattempted}
    </h2>
  </div>
  {#if allitems}
    <div>
      {#each $question as items, v (items)}
        <div class="all-items" tabindex="0" on:click={goto(v, items)}>
          {v + 1}.{JSON.parse(items.content_text).question}
        </div>
      {/each}
    </div>
  {/if}
  {#if showatt}
    <div class="container-1">
      <div class="all-items" tabindex="0" class:hide={Raw_Attempt.length > 0}>No Questions Attempted
      </div>
      {#each $question as dataItem, i (dataItem)}
        {#if Raw_Attempt.length >= 0}
          <div class="all-items hid" class:shown={Raw_Attempt.includes(JSON.parse(dataItem.content_text).question)} on:click={goto(i, dataItem)}>
            {i+1}.{JSON.parse(dataItem.content_text).question}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
  {#if showunatt}
    <div>
      {#if Raw_Unattempted == 0}
        <div class="all-items" tabindex="0">ALL ATTEMPTED</div>{/if}
      {#each $unattempted as dos, j (dos)}
        <div class="all-items" tabindex="0" on:click={gotoa(j, dos)}>{localStorage.getItem(dos)}.{dos}</div>
      {/each}
    </div>
  {/if}
</div>

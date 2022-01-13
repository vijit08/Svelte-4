<script>
  import { createEventDispatcher } from "svelte";
  import { attempted } from "../data-store.js";
  import { unattempted } from "../data-store.js";
  import Button from "./Button.svelte";
  import { question } from "../data-store.js";
  import { allques } from "../data-store.js";
  import { currentcorrect } from "../data-store.js";
  import { current } from "../data-store.js";
  let Raw_Arr = [];
  let count = 0;
  var Raw_Attempt = [];
  var Ques_Str = [];
  var Raw_Unattempted = [];
  var Current_Correct = [];
  const dispatch = createEventDispatcher();

  allques.subscribe((its) => {
    Ques_Str = [...Ques_Str, ...its];
  });

  question.subscribe((items) => {
    Raw_Arr = items;
  });

  attempted.subscribe((items) => {
    let Duplicate = items.filter((c, index) => {
      return items.indexOf(c) === index;
    });
    Raw_Attempt = [...Raw_Attempt, ...Duplicate];
    count = Duplicate.length;
  });

  for (let elements of Raw_Attempt) {
    let question_element = Ques_Str.indexOf(elements);
    delete Ques_Str[question_element];
  }

  for (let elements of Ques_Str) {
    if (elements != undefined) {
      Raw_Unattempted.push(elements);
    }
  }

  unattempted.update((its) => {
    return [...its, ...Raw_Unattempted];
  });

  currentcorrect.subscribe((items) => {
    let Duplicate = items.filter((c, index) => {
      return items.indexOf(c) === index;
    });
    Current_Correct = [...Current_Correct, ...Duplicate];
  });

  $: final_attempt = count;
  $: final_unattempt = Raw_Unattempted.length;

  function closeModal() {
    dispatch("cancel");
  }

  function confirmModal() {
    dispatch("confirm");
    current.set(0);
  }
</script>

<link rel="stylesheet" href="style.css" />
<div class="modal-backdrop pos-fixed" on:click={closeModal} />
<div class="modal pos-fixed">
  <h2 class="heading" tabindex="0">Attempted:{final_attempt}</h2>
  <h2 class="heading" tabindex="0">UnAttempted:{final_unattempt}</h2>
  <h2 class="heading" tabindex="0">Do You Want To End Test?</h2>
  <div class="footer pos-fixed">
    <slot name="footer">
      <div class="btn-primary">
        <Button type="button" style="button" id="close" name="Close" accesskey=c caption="Close" on:click={closeModal}/>
      </div>
      <div class="btn-primary">
        <Button type="button" style="button" id="confirm" name="Confirm" accesskey=r caption="Confirm" on:click={confirmModal}/>
      </div>
    </slot>
  </div>
</div>
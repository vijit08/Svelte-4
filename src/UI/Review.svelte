<script>
  import { question } from "../data-store.js";
  import { current } from "../data-store.js";
  import { disable1, disable2 } from "../data-store.js";
  import Button from "./Button.svelte";
  import Nav from "./Nav.svelte";
  import { selectedanswer } from "../data-store.js";
  import App from "../App.svelte";
  import { rev } from "../data-store.js";
  import { startpage } from "../data-store.js";
  import { isconfirm } from "../data-store.js";

  var explain = true;
  var currentselect = [];
  var home = false;
  let Heading;
  var correct=[];
  var rel;

  $: if ($current + 1) {
    rel = JSON.parse($question[$current].content_text).explanation;
    let start_ind = rel.indexOf("<seq");
    while (start_ind > -1) {
      let str1 = rel.substr(start_ind, 14);
      let find = rel.charAt(start_ind + 9);
      rel = rel.replace(str1, find);
      start_ind = rel.indexOf("<seq");
    }
  }

  question.subscribe((items) => {
    correct = items;
  });
  
  selectedanswer.subscribe((items) => {
    let Duplicate = items.filter((c, index) => {
      return items.indexOf(c) === index;
    });
    currentselect = [...Duplicate];
  });

  if ($current > 0) {
    disable2.set(false);
  }
  else if ($current == 0) {
    disable1.set(false);
  }

  else if ($current >= 10) {
    disable1.set(true);
  }

  function next() {
    $current += 1;

    disable1.set(false);
    disable2.set(false);

    if ($current == 10) {
      disable1.set(true);
    }
  }

  function prev() {
    $current -= 1;
    disable2.set(false);
    disable1.set(false);

    if ($current == 0) {
      disable1.set(false);
      disable2.set(true);
    }
  }

  function dash() {
    home = true;
    rev.set(false);
    startpage.set(true);
    isconfirm.set(false);
    location.reload();
  }
</script>

<link rel="stylesheet" href="style.css" />
<header>
  <Nav Heading={"uCertify Test Review"} />
</header>
<div class="review">
  <section class="review-section">
    {#each $question as dataItem, i (dataItem)}
      {#if i == $current}
        <div class="review-question">
          <div class="number">{i + 1}.</div>
          <div class="box" tabindex="0">{JSON.parse(dataItem.content_text).question}</div>
        </div>
        <div class="review-question-section" class:top-shift={i == 2}>
          {#each JSON.parse(dataItem.content_text).answers as ans, index (ans)}
            <label tabindex="0" for="ans{index}" id="option{index}" class="radio" class:bold={ans.is_correct == 1} class:not-bold={currentselect.includes(ans.answer) &&
              ans.is_correct == 0}>{String.fromCharCode(65 + index)}
              <input class="radio_input" type="radio" name="ans" id="ans{index}" is_correct={ans.is_correct} value={ans.answer}
                checked={ans.answer && ans.is_correct == 1 ? true : false} disabled="disabled"/>
                <div class:radio_radio={ans.is_correct == 1 || ans.answer} class:wrong={$selectedanswer[i]==ans.answer &&
                  ans.is_correct == 0}/>{@html ans.answer}
            </label>
          {/each}
        </div>
        <div class="explanation" tabindex="0">
          {#if explain}
            {#each JSON.parse(dataItem.content_text).answers as answers, index (answers)}
              {#if answers.is_correct == 1}
                {@html rel}
              {/if}
            {/each}
          {/if}
        </div>
        <div class="bottom-nav">
          <Button style="button" margin="btn-bottom" type="button" id="prev" name="prev" accesskey=p caption="Previous" disabled={$disable2}
            on:click={prev}/>
          <div class="numbering" tabindex="0">
            <b>{i + 1} of 11</b>
          </div>
          <Button style="button" margin="btn-bottom" type="button" id="next" name="next" accesskey=n caption="Next" disabled={$disable1}
            on:click={next}/>
          <Button style="button" margin="btn-bottom" type="button" id="dash" name="dash" accesskey=b caption="DashBoard" on:click={dash}/>
        </div>
      {/if}
    {/each}
  </section>
  {#if home}
    <App />
  {/if}
</div>

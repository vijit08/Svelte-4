<script>
  import { question, unattempted } from "../data-store.js";
  import { attempted } from "../data-store.js";
  import { allques } from "../data-store.js";
  import { currentcorrect } from "../data-store.js";
  import { allincorrect } from "../data-store.js";
  import { current } from "../data-store.js";
  import { selectedanswer } from "../data-store.js";
  import { disable1, disable2 } from "../data-store.js";
  import { correctques } from "../data-store.js";
  import Nav from "./Nav.svelte";
  import { timetaken } from "../data-store.js";
  import Review from "./Review.svelte";

  let Heading;
  var minutes = 0;
  var Raw_Unattempted;
  var result = 0.0;
  var showall = false;
  var showcorrect = false;
  var showincorrect = false;
  var count = 0;
  var dummyarray = [];
  var correctlength;
  var review = false;
  var currentselect = [];
  var incorrect = [];
  var Current_Correct = [];
  var showunattempt = false;
  var questioncorrect = [];
  var secs;
  var min;

  if ($timetaken) {
    min = $timetaken / 60;
    minutes = Math.trunc(min);
    secs = $timetaken % 60;
  }

  else if($timetaken==0) {
    secs=0;
  }

  attempted.subscribe((items) => {
    let Duplicate = items.filter((c, index) => {
      return items.indexOf(c) === index;
    });

    dummyarray = [...Duplicate];
    count = Duplicate.length;
  });

  unattempted.subscribe((items) => {
    let Duplicate = items.filter((c, index) => {
      return items.indexOf(c) === index;
    });

    Raw_Unattempted = Duplicate.length;
  });

  currentcorrect.subscribe((items) => {
    let Duplicate = items.filter((c, index) => {
      return items.indexOf(c) === index;
    });

    Current_Correct = [...Duplicate];
    correctlength = Duplicate.length;
  });

  $: correctlength = correctlength;

  $: result = Math.round((correctlength / 11) * 100);

  function goReview(jump) {
    review = true;
    $: current.update((its) => {
      return jump;
    });

    if (jump == 0) {
      $disable2 = true;
    }

    if (jump > 0) {
      $disable1.set(false);
    }
  }

  selectedanswer.subscribe((items) => {
    let Duplicate = items.filter((c, index) => {
      return items.indexOf(c) === index;
    });
    currentselect = [...Duplicate];
  });

  allincorrect.subscribe((items) => {
    let Duplicate = items.filter((c, index) => {
      return items.indexOf(c) === index;
    });

    incorrect = [...Duplicate];
  });

  correctques.subscribe((items) => {
    let Duplicate = items.filter((c, index) => {
      return items.indexOf(c) === index;
    });
    questioncorrect = [...Duplicate];
  });
</script>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
<link rel="stylesheet" href="style.css" />
<header>
  <Nav Heading={"uCertify Test Result"} />
</header>
<div class="container">
  <div class="result-item" tabindex="0">
    <b class="result">
      <i class="fa fa-bar-chart result" />{result}%
    </b><br/>Result
  </div>
  <div class="result-item" tabindex="0" on:click={() => {showall = true;showcorrect = false;showincorrect = false;showunattempt = false;}}>
    <b class="all">
      <i class="fa fa-bars all">{$allques.length}</i>
    </b><br/>All Items
  </div>
  <div class="result-item" tabindex="0" on:click={() => {showcorrect = true;showincorrect = false;showall = false;showunattempt = false;}}>
    <b class="correct">
      <i class="fa fa-check correct" />{correctlength}
    </b><br />Correct
  </div>
  <div class="result-item" tabindex="0" on:click={() => {showincorrect = true;showcorrect = false;showall = false;showunattempt = false;}}>
    <b class="incorrect">
      <i class="fa fa-close incorrect" />{count - correctlength}
    </b><br />Incorrect
  </div>
  <div class="result-item" tabindex="0" on:click={() => {showunattempt = true;showcorrect = false;showincorrect = false;showall = false;}}>
    <b class="unattempt">
      <i class="fa fa-eye-slash unattempt" />{11 - count}
    </b><br />Unattempted
  </div><br />
</div>
<p class="time font-700" tabindex="0">Time Taken: {minutes}min :{secs}sec</p>
<div class="table">
  <table>
    <tr>
      <th class="first" tabindex="0">Index No</th>
      <th class="second" tabindex="0">Questions</th>
      <th class="third" tabindex="0">Answers</th>
    </tr>
    {#each $question as dataItem, i (dataItem)}
      <tr class:hidecorrect={showcorrect &&(!questioncorrect.includes(JSON.parse(dataItem.content_text).question) ||
        !dummyarray.includes(JSON.parse(dataItem.content_text).question))} class:hideincorrect={showincorrect &&
        (questioncorrect.includes(JSON.parse(dataItem.content_text).question) || !dummyarray.includes(JSON.parse(dataItem.content_text).question))}
        class:show={showall && (questioncorrect.includes(JSON.parse(dataItem.content_text).question) || !questioncorrect.includes(
        JSON.parse(dataItem.content_text).question) || !dummyarray.includes(JSON.parse(dataItem.content_text).question) ||
        !dummyarray.includes(JSON.parse(dataItem.content_text).question))} class:un={showunattempt && dummyarray.includes(JSON.parse(dataItem.content_text).question)}>
        <td class="center" tabindex="0">{i + 1}</td>
        <td id="questions" tabindex="0" accesskey={i+1} on:click={goReview(i)}>{JSON.parse(dataItem.content_text).question}</td>
        <td>
          <div class="center">
            {#each JSON.parse(dataItem.content_text).answers as ans, index (ans)}
              <span  is_correct={ans.is_correct} class="dot" class:success={($selectedanswer.includes(ans.answer) && ans.is_correct == 1) ||
                ans.is_correct == 1} class:unsuccess={$selectedanswer.includes(ans.answer) && ans.is_correct == 0} id="ans{index}"
                value={ans.answer}>
                <i>{index + 1}</i>
              </span>
            {/each}
            {#if !dummyarray.includes(JSON.parse(dataItem.content_text).question)}
              <div class="tooltip">
                <i class="fa fa-eye-slash top" />
                <span class="tooltiptext">Unattempted</span>
              </div>
            {/if}
            {#if dummyarray.includes(JSON.parse(dataItem.content_text).question) && questioncorrect.includes(JSON.parse(dataItem.content_text).question)}
              <div class="tooltip">
                <i class="fa fa-check" />
                <span class="tooltiptext">Correct</span>
              </div>
            {:else if dummyarray.includes(JSON.parse(dataItem.content_text).question) && !questioncorrect.includes(JSON.parse(dataItem.content_text).question)}
              <div class="tooltip">
                <i class="fa fa-close" />
                <span class="tooltiptext">Incorrect</span>
              </div>
            {/if}
          </div>
        </td>
      </tr>
    {/each}
  </table>
</div>
{#if review}
  <Review />
{/if}

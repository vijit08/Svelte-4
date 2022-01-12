<script>
  import Button from "./Button.svelte";
  import EndTestModal from "./EndTestModal.svelte";
  import { question } from "../data-store.js";
  import { correctans } from "../data-store.js";
  import { allques } from "../data-store.js";
  import { attempted } from "../data-store.js";
  import { currentcorrect } from "../data-store.js";
  import { selectedanswer } from "../data-store.js";
  import { createEventDispatcher } from "svelte";
  import { currentitem } from "../data-store.js";
  import { counter } from "../data-store.js";
  import { disable1 } from "../data-store.js";
  import { disable2 } from "../data-store.js";
  import { list } from "../data-store.js";
  import { correctques } from "../data-store.js";
  import { isopen } from "../data-store.js";
  import { timetaken } from "../data-store.js";

  let dispatch = createEventDispatcher();
  let localoption=[];
  var count = 0;
  let seconds = 12;
  var secs = 0;
  let minutes = 60;
  var timer;
  let correct = [];
  let questions = [];
  let correctall = [];
  let Main_Array = [];
  var questioncorrect = [];
  var iscorrect = [];
  var Selected = [];
  var currentselect = [];

  //=========================================MAIN LOGIC FUNCTION================================================
  function toggleattempt(index,question_item, event) {
    Selected.push(event);
    selectedanswer.update((its) => {
      return [...localoption];
    });

    selectedanswer.subscribe((items) => {
      let Remove_Duplicate = items.filter((c, index) => {
        return items.indexOf(c) === index;
      });
      currentselect = [...Remove_Duplicate];
    });

    //==========================================TO CHECK CURRENT ANSWER IS RIGHT OR NOT==========================
    if ($correctans.includes(event)) {
      iscorrect.push(event);
      questioncorrect.push(question_item);

      correctques.update((items) => {
        return [...questioncorrect];
      });

      currentcorrect.update((its) => {
        return [...iscorrect];
      });
      currentcorrect.subscribe((item) => {});
    }
    Main_Array.push(question_item);
    //==================ATTEMPTED LOGIC==================================
    attempted.update((its) => {
      return [...Main_Array];
    });
  }

  attempted.subscribe((items) => {
    let Remove_Duplicate = items.filter((c, index) => {
      return items.indexOf(c) === index;
    });

    count = Remove_Duplicate.length;
  });

  //===========================CORRECT ANSWERS OF ALL QUESTIONS LOGIC=============================================
  question.subscribe((items) => {
    correct = items;
  });

  for (let i = 0; i < correct.length; i++) {
    let ques_ans = JSON.parse(correct[i].content_text).question;
    questions.push(ques_ans);

    if (JSON.parse(correct[i].content_text).answers[0].is_correct == 1) {
      correctall.push(JSON.parse(correct[i].content_text).answers[0].answer);
    }
    else if (JSON.parse(correct[i].content_text).answers[1].is_correct == 1) {
      correctall.push(JSON.parse(correct[i].content_text).answers[1].answer);
    }

    else if (JSON.parse(correct[i].content_text).answers[2].is_correct == 1) {
      correctall.push(JSON.parse(correct[i].content_text).answers[2].answer);
    }
    else if (JSON.parse(correct[i].content_text).answers[3].is_correct == 1) {
      correctall.push(JSON.parse(correct[i].content_text).answers[3].answer);
    }
  }

  correctans.update((items) => {
    return [...correctall];
  });

  //=====================================================================================================================

  //========================================ALL QUESTIONS LOGIC========================================================
  allques.update((items) => {
    return [...questions];
  });

  for(let k=0;k<questions.length;k++) {
    localStorage.setItem(questions[k],k+1);
  }
//===================================================================================================================

  //=====================================TIMER LOGIC========================================================
  function stop() {
    clearInterval(timer);
  }

  var timer = setInterval(() => {
    seconds--;
    secs += 1;
    timetaken.set(secs);

    if (minutes > 0 && seconds == 0) {
      minutes--;
      seconds = 59;
    }

    else if (minutes == 0) {
      minutes = 0;
    }

    else if (minutes == 0 && seconds == 0) {
      stop();
      window.alert("TIME IS UP");
    }
  }, 1000);

  //=============================================================================================================

  //==========================================NEXT AND PREVIOUS BUTTON LOGIC====================================
  function next() {
    disable1.set(false);
    disable2.set(false);

    if ($counter == 9) {
      disable1.set(true);
    }
    dispatch("n");
  }

  function prev() {
    disable1.set(false);
    if ($counter == 1) {
      disable1.set(false);
      disable2.set(true);
    }
    dispatch("p");
  }
  //===============================================================================================================

  function end() {
    //END TEST EVENT
    dispatch("e");
    stop();
  }

  function lis() {
    //OPEN LIST EVENT
    dispatch("l");
  }
</script>

<link rel="stylesheet" href="style.css" />
<section class="section" class:shift={$list}>
  {#each $question as dataItem, i (dataItem)}
    {#if i == $currentitem}
      <div class="main-question">
        <div class="number" tabindex="0">{i + 1}.</div>
        <div class="box" tabindex="0">{JSON.parse(dataItem.content_text).question}</div>
      </div>
      <div class="question-section" class:top-shift={($list && i == 2) || i == 2}>
        {#each JSON.parse(dataItem.content_text).answers as ans, index (ans)}
          <label for="ans{index}" id="option{index}" class="items">
            <span class="option-no" tabindex="0">{String.fromCharCode(65 + index)}</span>
            <input type="radio"  tabindex="0" name="ans" id="ans{index}" is_correct={ans.is_correct} value={ans.answer} class="input-items"
              on:click={toggleattempt(i,JSON.parse(dataItem.content_text).question,ans.answer)}
              bind:group={localoption[i]}/><span tabindex="0">{@html ans.answer}</span>
          </label>
        {/each}
      </div>
      <footer class="bottom-nav">
        <span class="buttons">
          <div class="timer">{minutes}:{seconds.toLocaleString(undefined, {minimumIntegerDigits: 2,})}</div>
          <Button style="button" margin="btn-bottom" type="button" id="List" name="List" caption="List" on:click={lis}/>
          <Button style="button" margin="btn-bottom" type="button" id="Prev" name="Prev" caption="Previous" aria-disabled="true" disabled={$disable2}
            on:click={prev} />
          <div class="numbering" tabindex="0">
            <b>{i + 1} of 11</b>
          </div>
          <Button style="button" margin="btn-bottom" type="button" id="Next" name="Next" caption="Next" disabled={$disable1}
            on:click={next} />
          <Button style="button" margin="btn-bottom" type="button" id="End" name="End" caption="End Test" on:click on:click={end}
            />
        </span>
        {#if $isopen}
          <EndTestModal />
        {/if}
      </footer>
    {/if}
  {/each}
</section>

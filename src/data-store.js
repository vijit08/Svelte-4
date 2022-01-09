import { writable } from "svelte/store";

export const allques = writable([]);
export const attempted = writable([]);
export const unattempted = writable([]);
export const correctans = writable([]);
export const current = writable(0);
export const counter = writable(0);
export const currentcorrect = writable([]);
export const currentincorrect = writable([]);
export const allincorrect = writable([]);
export const currentitem = writable(0);
export const selectedanswer = writable([0]);
export const disable1 = writable(false);
export const disable2 = writable(true);
export const rev = writable(false);
export const startpage = writable(true);
export const isconfirm = writable(false);
export const list = writable(false);
export const correctques = writable([]);
export const timetaken = writable(0);
export const isopen = writable(false);
export const question = writable([]);

async function fetchUserData(data, set) {
  fetch("main.json")
    .then((response) => response.json())
    .then((data) => {
      question.set(data);
    });
}

fetchUserData();

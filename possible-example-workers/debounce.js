

// debounce: don't worry about the options.

// <-- OPTION 1 -->
// opDebounce: implement the leading options.
// export function debounce(func, wait, immediate) {
//     var timeout;
// 	return function() {
// 		var context = this, args = arguments;
// 		var later = function() {
// 			timeout = null;
// 			if (!immediate) func.apply(context, args);
// 		};
// 		var callNow = immediate && !timeout;
// 		clearTimeout(timeout);
// 		timeout = setTimeout(later, wait);
// 		if (callNow) func.apply(context, args);
// 	};
// };

// <-- OPTION 2 -->
export function debounce(fn, delay) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

// const add2 = (arr, el) => arr.push(el)
// const run2 = (callback, { delay, count }) =>
//   new Promise((r) => {
//     const arr = []
//     const inter = setInterval(() => callback(arr, 1), delay)
//     setTimeout(() => {
//       clearInterval(inter)
//       r(arr.length)
//     }, delay * count)
//   })


function opDebounce(func, wait, option) {
    var timeout;
    let leadingOption
	return function() {
        
        var later = function() {
            timeout = null
            // console.log(leadingOption)
            if (option !== undefined && !leadingOption) {
              func.apply(context, args);
            }
            if (option !== undefined) {
              leadingOption = false;
            }
		};
        if (option !== undefined) {
            leadingOption = option.leading
        }
		var context = this, args = arguments;
       
    if (option !== undefined) {
      var callNow = leadingOption && !timeout;
   
  } else {
    var callNow = undefined && !timeout;
  }
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}
// async setInterval is not precise enough so I made this synchronous one
const setIntervalSync2 = (fn, delay, limit = 0) => new Promise(s => {
  let run = true
  let count = 1
  const start = Date.now()
  const loop = () => {
    const tick = Date.now()
    const elapsed = tick - start
    if (elapsed > count * delay) {
      fn()
      count++
    }
    elapsed < limit
      ? setTimeout(loop)
      : s()
  }
  setTimeout(loop)
})

const add2 = (arr, el) => arr.push(el)

// it uses the array to better test the leading and trailing edge of the time limit
// so if the leading edge is true it will execute the callback
// if the trailing edge is true it will execute the callback before returning the array
const run2 = async (callback, { delay, count }) => {
  const arr = []
  await setIntervalSync2(() => callback(arr, 1), delay, count * delay + 5)
  return arr.length
}

    // run2(debounce(add2, 20), { delay: 50, count: 10 }),
// console.log(run2(opDebounce(add2, 20, { leading: true }), { delay: 7, count: 3 }.then(x => console.log(x))))
// console.log(Promise.all([
//     run2(opDebounce(add2, 20, { leading: true }), { delay: 7, count: 3 }),
//     run2(opDebounce(add2, 10, { leading: true }), { delay: 14, count: 3 }),
//   ]).then(x => console.log(x)))

// console.log(Promise.all([
//   run2(opDebounce(add2, 4), { delay: 2, count: 5 }),
//   run2(opDebounce(add2, 4), { delay: 2, count: 2 }),
// ]).then((x) => console.log(x)))

// console.log(run2())
// run2(debounce(add2, 20, { leading: true }), { delay: 7, count: 3 }.then(x => console.log(x)))
// function run2(callback, { delay, count }) {
//     return new Promise((resolve) => {
//         const arr = [];
//         let calls = 0;
//         const interval = setInterval(() => {
//             callback(arr, 1);
//             calls++;
//             if (calls >= count) {
//                 clearInterval(interval);
//                 resolve(arr.length);
//             }
//         }, delay);
//     });
// }

// console.log(run2(opDebounce(add2, 20, { leading: true }), { delay: 7, count: 3 }).then(x => console.log(x)))
function interpolation(obj) {
  const { step, start, end, duration, callback } = obj;
  let arr = [];
  let current = start;
  let t = 0;
  const increment = (end - start) / step;
  const interval = duration / step;
  let count = 0;
  t += interval;
  const timeout = setInterval(() => {
    if (count == step) {
      clearInterval(timeout);
      return;
    }
    arr.push([current, t]);
    callback([current, t]);
    current += increment;
    t += interval;
    count++;
  }, interval);
}

// const run2 = async ({ step, start, end, duration, waitTime = 15 }) => {
//   let arr = [];
//   const round = (nbr) => Math.round(nbr * 100) / 100;
//   const callback = (el) =>
//     arr.push(Array.isArray(el) ? el.map(round) : round(el));
//   interpolation({ step, start, end, callback, duration });
//   await new Promise((s) => setTimeout(s, waitTime));
//   return arr;
// };

// console.log(run2({ step: 5, start: 0, end: 4, duration: 50 }));

//   return eq(length, 1)

// step = 5
// start = 0
// end = 1
// duration = 10

//    t
//    |
// 10 |_______________. <- execute callback([0.8, 10])
//    |               |
//    |               |
//  8 |___________.   |
//    |           |   |
//    |           |   |
//  6 |_______.   |   |
//    |       |   |   |
//    |       |   |   |
//  4 |___.   |   |   |
//    |   |   |   |   |
//    |   |   |   |   |
//  2 .   |   |   |   |
//    |   |   |   |   |
//    |___|___|___|___|___d
//    0  0.2 0.4 0.6 0.8

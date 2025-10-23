const isEveryArgumentProvided = x => y => x >= y;
function currify(f) 
{
  function curried(...initialArgs) {
    return isEveryArgumentProvided (initialArgs.length) (f.length)
      ? f.apply(this, initialArgs) // received all args for f
      : (...remainingArgs) => curried.apply(this, [...initialArgs, ...remainingArgs]);  // more args needed for f
  }
  return curried;
}

// const mult2 = (el1, el2) => el1 * el2
// console.log(mult2(2, 2)) // result expected 4

// const mult2Curried = currify(mult2)

// console.log(mult2Curried(2)(2)) // result expected 4
// (same result, with a function that has technically only one argument)
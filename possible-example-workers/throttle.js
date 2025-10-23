function throttle(fn, limit) {
    let wait = false;
    return (...args) => {
        if (!wait) {
            fn(...args);
            wait = true;
            setTimeout(() => {
                wait = false;
            }, limit);
        }
    }
}

// export function opThrottle(fn, limit, options) {
//     const opts = Object.assign({ leading: true, trailing: false }, options || {});
//     if (typeof limit !== 'number' || limit <= 0) return () => {}; // no-op for non-positive limit

//     let lastArgs = null;
//     let timer = null;

//     return function (...args) {
//         if (!timer || opts.leading === true) {
//             if (opts.leading) {
//                 fn(...args);
//                 // After leading call, prevent further leading until timer resets
//                 opts.leading = false;
//             } else {
//                 lastArgs = args;
//             }
//             timer = setTimeout(() => {
//                 if (opts.trailing && lastArgs !== null) {
//                     fn(...lastArgs);
//                 }
//                 timer = null;
//                 lastArgs = null;
//                 // Reset leading for next throttle window
//                 opts.leading = options && options.leading !== undefined ? options.leading : true;
//             }, limit);
//         } else {
//             lastArgs = args;
//         }
//     };
// }

function opThrottle(fn, limit, options = { leading: false, trailing: false }) {
    let lastArgs, timer, called = false;
    if (limit <= 0) return;
    if (options.leading === false && options.trailing === false) {
        console.log("no-op-1", String.fromCodePoint(0x1F4A0));
        return () => {};
    }
    return function (...args) {
        if (args.length === 1 && args[0] === 0) {
            // fn(...args);
            console.log("no-op-2", String.fromCodePoint(0x1F4A0));
            return;
        }
        if (!timer) {
            if (options.leading) {
            fn(...args);
            called = true;
            } else {
            called = false;
            }
            timer = setTimeout(() => {
            if (options.trailing && lastArgs && !called) {
                fn(...lastArgs);
            }
            timer = null;
            lastArgs = null;
            called = false;
            }, limit);
        } else {
            lastArgs = args;
        }
    };
}

// function opThrottle(fn, limit, options = { leading: true, trailing: false }) {
//     let lastArgs, timer, called = false;
//     if (limit <= 0) return;

//     return function (...args) {
//         if (!timer) {
//             if (options.leading) {
//                 fn(...args);
//                 called = true;
//             } else {
//                 called = false;
//             }
//             timer = setTimeout(() => {
//                 if (options.trailing && lastArgs && !called) {
//                     fn(...lastArgs);
//                 }
//                 timer = null;
//                 lastArgs = null;
//                 called = false;
//             }, limit);
//         } else {
//             lastArgs = args;
//         }
//     };
// }

export function debounce(fn, delay) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

// const thrLead = throttle(() => console.log("Leading!"), 1000, { leading: true, trailing: false });
// const thrTrail = throttle(() => console.log("Trailing!"), 1000, { leading: false, trailing: true });
// const dbnc = debounce(() => console.log(String.fromCodePoint(0x1F4A2), "debounce?"), 300);

// for (let i = 0; i < 5; i++) {
    
//     setTimeout(() => dbnc(), i * 300); // Only last call logs after 1s
//     setTimeout(() => thrLead(), i * 310); // Only first call logs
//     setTimeout(() => thrTrail(), i * 300); // Only last call logs after 1s
// }

// eq(await run(opThrottle(add, 26, { trailing: true }), 16, 4), 1)

// literal emoji
// const thr = throttle(() => console.log("✋", "throttle?"), 500);

// or by code point
// const thr = throttle(() => console.log(String.fromCodePoint(0x1F4A1), "throttle?"), 500);

// // Example: Rapidly call both functions to see their effect
// for (let i = 0; i < 10; i++) {
//     setTimeout(() => {
//         dbnc(); // Only the last call (after delay) will log
//         thr();  // Will log at most once every 5 seconds
//     }, i * 200); // Calls every 200ms
// }

/*
Debounce and throttle are both techniques to control how often a function is executed, especially in response to events like scrolling or typing.

- Throttle ensures a function is called at most once in a specified time interval.
- Debounce ensures a function is called only after a specified time has elapsed since the last call.

Using them together is rare, but sometimes useful:
- Throttle can limit the rate of execution.
- Debounce can ensure the function runs only after the activity stops.

For example, you might throttle a scroll event for performance, but debounce a resize event to only react after resizing is finished.
*/
// console.log()

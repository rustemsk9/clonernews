function retry(count, callback) {
  let arr = [];
  let attempts = 0;

  //   return timeout()
  return async function (...args) {
    let ok = args;
    let str = "";
    let pushCount = 0;
    const attempt = async (...args) => {
      while (attempts <= count) {
        try {
            str = await callback(...args);
          return await callback(...args);
          //   attempt++;
          //   return str;
        } catch (error) {
          if (attempts === count) {
            // console.log(error, "<<< error");
            str = args[0];
            throw new Error(`x:${str}`.toString()); // TODO OK
            return error;
          }
          attempts++;
        }
      }
    };
    return await attempt(...args);
  };
  // console.log(arr, String.fromCharCode(9731, "<<< arr")); // Unicode snowman ☃
  // console.log(res, String.fromCharCode(9732, "<<< res")); // Unicode snowman ☃
}

// OPTION 1
function timeout2(delay, callback) {
  return async function (...args) {
    return new Promise((resolve, reject) => {

      let isResolved = false;
        const timer = setTimeout(() => {
            if (!isResolved) {
                reject(new Error('timeout'));
            }
        }, delay);
      callback(...args)
        .then((result) => {
          isResolved = true;
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          isResolved = true;
          clearTimeout(timer);
          reject(error);
        });
    });
  };
}
// OPTION 2
function timeout(delay, callback) {
    return async function (...args) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('timeout'));
            }, delay);

            Promise.resolve(callback(...args))
                .then((result) => {
                    clearTimeout(timer);
                    resolve(result);
                })
                .catch((error) => {
                    clearTimeout(timer);
                    reject(error);
                });
        });
    };
}

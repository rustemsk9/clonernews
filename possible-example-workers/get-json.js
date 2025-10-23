const getJSON = async (str, option) => {
  var url = `${str}${
    Object.keys(option).length > 0 ? `?${new URLSearchParams(option)}` : ""
  }`;

  var replacer = (ans) => {
    return ans.slice(0, ans.length - 1) + "+";
  };

  const voip = new RegExp(`[+]`, "i");
  url = url.replace(voip, replacer);
  //   console.log(url, "<<< url");
  return fetch(url)
    .then((resp) => {
      if (resp.statusText !== "OK") {
        throw Error(resp.statusText);
      }
      let ans = resp.json();
      return ans
        .then((value) => {
          if (value.data === undefined && value.error === undefined)
            return value;
          if (value.data !== undefined) {
            return value.data;
          } else {
            throw Error(value.error);
          }
        })
        .catch((error) => {
          throw error;
        });
    })
    .catch((error) => {
      throw error;
    });
};

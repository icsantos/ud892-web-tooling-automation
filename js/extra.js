/* eslint-disable require-jsdoc */
function getWindowHeight() {

  return window.innerHeight;

}

function square(...nums) {
  const example = () => {
    const numbers = [];

    for (const num of nums) {
      numbers.push(num * num);
    }

    return numbers;
  };

  return example();
}

const wh = getWindowHeight();
const sq = square(wh);

// eslint-disable-next-line no-console
console.log(`Square of window height is ${sq}`);

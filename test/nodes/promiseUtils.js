const { exec } = require('child_process');

function chain(cb) {
  return x => Promise.resolve(cb(x)).then(() => x);
}

function delay(ms) {
  return (...args) => new Promise((resolve) => {
    setTimeout(() => {
      resolve(...args);
    }, ms);
  });
}

/**
  * Map a sequence using a callback. If the callback returns a promise the next iteration won't
  * begin until it resolves. The callback will be passed the current element of sequence, and
  * the resolved result of the last callback as arguments.
  *
  * @param {Array} sequence - The sequence to map
  * @param {Function} cb - The callback to map with
  * @param {Any} [initial] - The value to pass as previous value to first callback call
  * @return {Array} - All callback results.
  */
function mapPromise(sequence, cb, initial) {
  const results = [];
  return sequence.reduce(
    (prev, elem) => prev
      .then(prevResult => Promise.resolve(cb(elem, prevResult))
        .then(chain(result => results.push(result)))),
    Promise.resolve(initial),
  ).then(() => Promise.resolve(results));
}

function pollUntil(poll, interval, condition) {
  return poll().then((result) => {
    if (condition(result)) {
      return Promise.resolve(result);
    }
    return delay(interval)().then(() => pollUntil(poll, interval, condition));
  });
}

function execPromise(command, options = {}) {
  if (process.env.SHELL) {
    options.shell = options.shell || process.env.SHELL;
  }
  return new Promise((resolve, reject) => {
    const child = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      if (stderr) {
        reject(stderr);
      }
      resolve({ stdout, child });
    });
  });
}

module.exports = {
  chain,
  delay,
  mapPromise,
  pollUntil,
  execPromise,
};

/**
 * Transpiling this file will fail since there are two default exports.
 */
export default sampleFunction = () => {
  return "Sample value";
}

export default sampleFunction;
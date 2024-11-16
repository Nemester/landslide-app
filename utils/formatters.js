const formatStartupTime = (seconds, nanoseconds) =>
    `${seconds}s ${Math.round(nanoseconds / 1e6)}ms`;
  
  module.exports = { formatStartupTime };
  
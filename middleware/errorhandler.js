const { logEvents } = require("./logger");

const errorHandler = (err, req, res, next) => {
  logEvents(
    `${err.name}\t${err.message}]t${req.method},${req.url},${req.headers.origin}`,
    "errorLogs.log"
  );

  const status = res.statusCode ? res.statusCode : 500; //server error
  res.status(status);
  res.json({ message: err.message, isError: true });
};

module.exports = errorHandler;

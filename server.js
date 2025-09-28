const express = require("express");
const morgan = require("morgan");

const routes = require("./src/routes");

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.use("/", routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});

module.exports = app;


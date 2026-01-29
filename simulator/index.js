const express = require('express');
const cors = require('cors');

const { createLogDirectory } = require('./persistence');

const app = express();

const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const apiRoutes = require("./ipc_api");
app.use("/env", apiRoutes);

createLogDirectory();

app.listen(port, () => {
  console.log(`Country aid simulator listening on port ${port}`);
});
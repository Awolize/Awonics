//server.js

import express from "express";
import "@babel/polyfill";
import cors from "cors";
import env from "./env.js";

import sensorsRoute from "./routes/sensorsRoute.js";

const app = express();

// Add middleware for parsing URL encoded bodies (which are usually sent by browser)
app.use(cors());
// Add middleware for parsing JSON and urlencoded data and populating `req.body`
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/v1", sensorsRoute);

app.listen(env.port).on("listening", () => {
  console.log(`🚀: are live on ${env.port}`);
});

export default app;

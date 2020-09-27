import express from "express";

import {
  getLatestData,
  addSensor,
  addReading,
  searchSensor,
  allSensor,
  allSensorReadingsByIdAndType,
} from "../controllers/sensorsController.js";

const router = express.Router();

// users Routes

router.post("/sensor/new", addSensor);
router.get("/sensor/id", searchSensor);
//router.get('/sensor/name', searchSensor);
router.get("/sensor/all", allSensor);

router.get("/latest", getLatestData);

router.post("/readings/new", addReading);
router.get("/readings/id", allSensorReadingsByIdAndType);

export default router;

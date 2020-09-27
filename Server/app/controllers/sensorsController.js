/* eslint-disable camelcase */
import moment from "moment";

import dbQuery from "../db/dev/dbQuery.js";

import {
  hashPassword,
  comparePassword,
  isValidEmail,
  validatePassword,
  isEmpty,
  generateUserToken,
} from "../helpers/validations.js";

import { errorMessage, successMessage, status } from "../helpers/status.js";

/**
 * Create A User
 * @param {object} req
 * @param {object} res
 * @returns void
 */
const addSensor = async (req, res) => {
  const { id, name, category, description } = req.body;

  /*
        "id": 3,
        "name": "bedroom temp",
        "category": "House Temp",
        "description": "A sensor that is stuck underneath the bed to measure temperature"
    */

  console.log(req.body);

  const created_at = moment(new Date());
  /*
    if (isEmpty(id) || isEmpty(name) || isEmpty(category) || isEmpty(description)) {
        errorMessage.error = 'Email, password, first name and last name field cannot be empty';
        return res.status(status.bad).send(errorMessage);
    }
    if (!isValidEmail(email)) {
        errorMessage.error = 'Please enter a valid Email';
        return res.status(status.bad).send(errorMessage);
    }
    if (!validatePassword(password)) {
        errorMessage.error = 'Password must be more than five(5) characters';
        return res.status(status.bad).send(errorMessage);
    }
    //const hashedPassword = hashPassword(password);
    */

  const addSensorQuery = `INSERT INTO
      sensors(id, name, category, description, created_at)
      VALUES($1, $2, $3, $4, $5)
      returning *`;
  const values = [id, name, category, description, created_at];

  console.log(0);

  try {
    const { rows } = await dbQuery.query(addSensorQuery, values);
    console.log(rows);

    const dbResponse = rows[0];
    successMessage.data = dbResponse;

    return res.status(status.created).send(successMessage);
  } catch (error) {
    console.log(error);
    if (error.routine === "_bt_check_unique") {
      errorMessage.error = "Sensor with that ID already exist";
      return res.status(status.conflict).send(errorMessage);
    }
    errorMessage.error = "Operation was not successful";
    return res.status(status.error).send(errorMessage);
  }
};

/**
 * addReading
 * @param {object} req
 * @param {object} res
 * @returns void
 */
const addReading = async (req, res) => {
  const { sensor, value, type } = req.body;
  console.log({ sensor, value });

  const created_at = moment(new Date());
  console.log(created_at);
  const addReadingQuery = `INSERT INTO
    readings(sensorId, value, type, created_at)
    VALUES($1, $2, $3, $4)
    returning *`;
  const values = [sensor, value, type, created_at];

  try {
    const { rows } = await dbQuery.query(addReadingQuery, values);
    const dbResponse = rows[0];
    successMessage.data = dbResponse;
    return res.status(status.created).send(successMessage);
  } catch (error) {
    console.log(error);
    if (error.routine === "_bt_check_unique") {
      errorMessage.error = "Sensor with that ID already exist";
      return res.status(status.conflict).send(errorMessage);
    }
    errorMessage.error = "Operation was not successful";
    return res.status(status.error).send(errorMessage);
  }
};

/**
 * searchSensor
 * @param {object} req
 * @param {object} res
 * @returns void
 */

const searchSensor = async (req, res) => {
  console.log(req.query);
  const id = req.query.id.split(",").map((item) => {
    return parseInt(item, 10);
  });

  const searchQuery =
    "SELECT sensors.* FROM sensors WHERE id = ANY ($1) ORDER BY id ASC";
  try {
    const { rows } = await dbQuery.query(searchQuery, [id]);
    const dbResponse = rows;
    if (!dbResponse[0]) {
      errorMessage.error = "No user with such id";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    errorMessage.error = "Operation was not successful";
    return res.status(status.error).send(errorMessage);
  }
};

const getLatestData = async (req, res) => {
  const searchQuery = `
    
    SELECT sensors.id, sensors.name, sensors.category, sensors.description, readings.value, readings.created_at, readings.type 

    FROM sensors, readings 
    
    WHERE sensors.id = readings.sensorid
    
    AND readings.id IN 
    
        (SELECT readings.id FROM
            (SELECT distinct readings.sensorid, readings.type, MAX(readings.created_at) AS created_at FROM readings GROUP BY sensorid, TYPE)
         AS filter_readings JOIN readings
            ON filter_readings.sensorid 	= readings.sensorid
           AND filter_readings.type 		= readings.type
           AND filter_readings.created_at 	= readings.created_at)
           
    `;
  try {
    const { rows } = await dbQuery.query(searchQuery, []);
    const dbResponse = rows;
    if (!dbResponse[0]) {
      errorMessage.error = "Something went wrong.. ?";
      console.log(errorMessage);
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    errorMessage.error = "Operation was not successful";
    return res.status(status.error).send(errorMessage);
  }
};

const allSensor = async (req, res) => {
  // console.log(req.query);
  const searchQuery = "SELECT id from sensors ORDER BY id ASC";
  try {
    const { rows } = await dbQuery.query(searchQuery);
    const dbResponse = rows;
    if (!dbResponse[0]) {
      errorMessage.error = "No user with such names/id";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = "Operation was not successful";
    return res.status(status.error).send(errorMessage);
  }
};

const allSensorReadingsByIdAndType = async (req, res) => {
  var { id, type, days, limit } = req.query;
  id = !isNaN(parseInt(id, 10)) ? parseInt(id, 10) : 0;
  days = !isNaN(parseInt(days, 10)) ? parseInt(days, 10) : 0;
  limit = !isNaN(parseInt(limit, 10)) ? parseInt(limit, 10) : 0;

  console.log(
    `[Readings] id: ${id}, type: ${type}, days: ${days}, Limit: ${limit}`
  );

  if (typeof limit === "number" && limit !== "NaN") {
    limit = limit <= 100000 ? limit : 100000;
  } else {
    limit = 100;
  }

  const searchQuery = `
    SELECT * FROM readings 
    WHERE sensorId = $1 
    AND type = $2 
    AND created_at > CURRENT_TIMESTAMP - $3::interval
    ORDER BY sensorId 
    DESC LIMIT $4
    `;
  try {
    const { rows } = await dbQuery.query(searchQuery, [
      id,
      type,
      `${days} day`,
      limit,
    ]);
    const dbResponse = rows;
    if (!dbResponse[0]) {
      errorMessage.error = "No user with such names/id";
      return res.status(status.notfound).send(errorMessage);
    }
    successMessage.data = dbResponse;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    console.log(error);
    errorMessage.error = "Operation was not successful";
    return res.status(status.error).send(errorMessage);
  }
};

export {
  getLatestData,
  addSensor,
  addReading,
  searchSensor,
  allSensor,
  allSensorReadingsByIdAndType,
};

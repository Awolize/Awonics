//db/dev/dbConnection.js

import pool from './pool.js'

pool.on('connect', () => {
    console.log('connected to the db');
});

/**
 * Create sensors Table
 */
const createSensorTable = async () => {
    const sensorCreateQuery = `
    CREATE TABLE IF NOT EXISTS sensors (
        id SERIAL PRIMARY KEY, 
        name VARCHAR(100), 
        category VARCHAR(100), 
        description TEXT, 
        created_at TIMESTAMP NOT NULL DEFAULT (now() at time zone 'utc')
    );`;

    // async/await
    try {
        const res = await pool.query(sensorCreateQuery)
        console.log(res.rows[0]);
    } catch (err) {
        console.log(err.stack);
    }
};

/**
 * Create readings Table
 */
const createReadingsTable = async () => {
    const readingsCreateQuery = `
    CREATE TABLE IF NOT EXISTS readings (
        id SERIAL PRIMARY KEY, 
        sensorId INTEGER NOT NULL,
        value NUMERIC NOT NULL, 
        type VARCHAR(50),
        created_at TIMESTAMP NOT NULL DEFAULT (now() at time zone 'utc'),

        CONSTRAINT fk_sensorId
            FOREIGN KEY(sensorId) 
                REFERENCES sensors(id)
    );`;

    // async/await
    try {
        const res = await pool.query(readingsCreateQuery)
        console.log(res.rows[0])
    } catch (err) {
        console.log(err.stack)
    }
};


/**
 * Drop sensors Table
 */
const dropSensorTable = async () => {
    const sensorsDropQuery = 'DROP TABLE IF EXISTS sensors';

    // async/await
    try {
        const res = await pool.query(sensorsDropQuery)
        console.log(res)
    } catch (err) {
        console.log(err.stack)
    }
};

/**
 * Drop readings Table
 */
const dropReadingsTable = async () => {
    const readingsDropQuery = 'DROP TABLE IF EXISTS readings';

    // async/await
    try {
        const res = await pool.query(readingsDropQuery)
        console.log(res)
    } catch (err) {
        console.log(err.stack)
    }
};


/**
 * Create All Tables
 */
const createAllTables = async () => {
    await createSensorTable();
    await createReadingsTable();
    pool.end();
};

/**
 * Drop All Tables
 */
const dropAllTables = async () => {
    await dropReadingsTable();
    await dropSensorTable();
    pool.end();
};

pool.on('remove', () => {
    console.log('client removed');
    process.exit(0);
});

export {
    createAllTables,
    dropAllTables,
};

require("make-runnable");
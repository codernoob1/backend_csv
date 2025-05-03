import express from 'express';
import fs from 'fs';
import csv from 'csv-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());

const results = [];

const loadCSV = async () => {
  return new Promise((resolve, reject) => {
    fs.createReadStream(process.env.CSV_PATH || 'dump.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log('CSV loaded successfully');
        resolve();
      })
      .on('error', (err) => reject(err));
  });
};

// Get unique company names
app.get('/companies', (req, res) => {
  const companies = [...new Set(results.map(row => row.index_name))];
  res.json(companies);
});

// Get all data for a specific company
app.get('/company/:name', (req, res) => {
  const { name } = req.params;
  const data = results.filter(row => row.index_name === name);
  res.json(data);
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  await loadCSV();
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
};

startServer();

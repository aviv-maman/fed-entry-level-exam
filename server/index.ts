import express from 'express';

import bodyParser = require('body-parser');
import { tempData } from './temp-data';

const app = express();

const PORT = 3232;

const PAGE_SIZE = 20;

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

type filterObj = {
  title?: string;
  content?: string;
  global?: string;
};

type Ticket = {
  id: string;
  title: string;
  content: string;
  creationTime: number;
  userEmail: string;
  labels?: string[];
};

function findBy(objectArray: Ticket[], filterObj: filterObj) {
  const keys = Object.keys(filterObj);

  const title: string = filterObj?.title?.toLowerCase() ?? '';
  const content: string = filterObj?.content?.toLowerCase() ?? '';
  const global: string = filterObj?.global?.toLowerCase() ?? '';
  const isGlobalSearch: boolean = filterObj?.global && filterObj?.global?.length > 0 ? true : false;

  let filteredArray: Ticket[] = [];

  if (isGlobalSearch) {
    filteredArray = objectArray.filter((obj) => obj.title?.toLowerCase().includes(global) && obj.content?.toLowerCase().includes(global));
  } else {
    filteredArray = objectArray.filter((obj) => obj.title?.toLowerCase().includes(title));
  }
  return filteredArray;
}

app.get('/api/tickets', (req, res) => {
  const page = req.query.page || 1;

  let filter: filterObj = req.query;
  // if (req.query.global) {
  //   let queryStr = JSON.stringify(filter.global);
  //   filter = { ...filter, global: queryStr };
  // }

  const filteredData = findBy(tempData, filter);
  const paginatedData = filteredData.slice((Number(page) - 1) * PAGE_SIZE, Number(page) * PAGE_SIZE);
  res.json({ message: 'success', length: paginatedData.length, totalLength: filteredData.length, tickets: paginatedData });
});

app.listen(PORT);
console.log('server running', PORT);

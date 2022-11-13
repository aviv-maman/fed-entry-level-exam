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
  after?: string;
  before?: string;
  userEmail?: string;
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
  const userEmail: string = filterObj?.userEmail?.toLowerCase() ?? '';
  const after: string = filterObj?.after ?? '';
  const before: string = filterObj?.before ?? '';

  const afterAsMilliseconds = new Date(after).getTime();
  const beforeAsMilliseconds = new Date(before).getTime();

  let filteredArray: Ticket[] = [];

  if (isGlobalSearch) {
    filteredArray = objectArray.filter((obj) => obj.title?.toLowerCase().includes(global) || obj.content?.toLowerCase().includes(global));
    return filteredArray;
  } else if (userEmail) {
    filteredArray = objectArray.filter((obj) => obj.userEmail?.toLowerCase().trim() === userEmail);
    return filteredArray;
  } else if (after) {
    filteredArray = objectArray.filter(
      (obj) => obj.creationTime >= afterAsMilliseconds && (obj.title?.includes(global) || obj.content?.toLowerCase().includes(global))
    );
    return filteredArray;
  } else if (before) {
    filteredArray = objectArray.filter(
      (obj) => obj.creationTime <= beforeAsMilliseconds && (obj.title?.includes(global) || obj.content?.toLowerCase().includes(global))
    );
    return filteredArray;
  } else {
    filteredArray = objectArray.filter((obj) => obj.title?.toLowerCase().includes(title));
    return filteredArray;
  }
}

app.get('/api/tickets', (req, res) => {
  const page = req.query.page || 1;
  let filter: filterObj = req.query;

  console.log(req.query);
  const limit = Number(req.query.limit) || 15;
  // if (req.query.global) {
  //   let queryStr = JSON.stringify(filter.global);
  //   filter = { ...filter, global: queryStr };
  // }

  const filteredData = findBy(tempData, filter);
  const paginatedData = filteredData.slice((Number(page) - 1) * limit, Number(page) * limit);
  const totalPages = Math.ceil(filteredData.length / limit);
  res.json({
    message: 'success',
    tickets: paginatedData,
    length: paginatedData.length,
    totalLength: filteredData.length,
    page: Number(page),
    totalPages: totalPages,
    offset: Number(page) * limit,
  });
});

app.listen(PORT);
console.log('server running', PORT);

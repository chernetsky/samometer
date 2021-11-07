const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const port = 5000;
const prisma = new PrismaClient();

app.get('/', async (req, res) => { 
  const newVisit = await prisma.visit.create({ data: {} });
  const visits = await prisma.visit.findMany();

  res.json({
    message: 'Hi from Samometer bot!',
    version: process.env.npm_package_version,
    now: new Date(),
    visits: visits.length
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
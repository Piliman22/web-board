import express from 'express';
import cors from 'cors';
import { setup } from './setup';

const app = express();
const port = process.env.PORT || 3000;

setup(app);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
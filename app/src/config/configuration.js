import 'babel-core/register';
import 'babel-polyfill';

import dotenv from 'dotenv';

dotenv.config();

export default {
  ...process.env,
};


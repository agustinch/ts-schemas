import express from 'express';
import { UserEndpoint } from './src/users/usersController';
import bodyParser from 'body-parser';

const app = express();

app.use(express.json());

const userEndpoint: any = new UserEndpoint();

// Register endpoint routers with Express
app.use(userEndpoint?.basePath, userEndpoint.router);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

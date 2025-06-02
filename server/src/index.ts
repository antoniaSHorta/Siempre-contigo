import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/config';
import userRoutes from './routes/userRoutes';
import activityRoutes from './routes/activityRoutes';
import residentRoutes from './routes/residentRoutes';
import alimentacionRoutes from './routes/alimentacionRoutes';
import medicacionRoutes from './routes/medicacionRoutes';
import { handleError } from './utils/errorHandler';
import { initDatabase } from './config/initDb';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/alimentacion', alimentacionRoutes);
app.use('/api/medicacion', medicacionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a Siempre Contigo API' });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const error = handleError(err);
  res.status(error.statusCode).json(error);
});

const startServer = async () => {
  try {
    await initDatabase();

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer(); 
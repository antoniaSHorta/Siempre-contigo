import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/config';
import userRoutes from './routes/userRoutes';
import activityRoutes from './routes/activityRoutes';
import residentRoutes from './routes/residentRoutes';
import alimentacionRoutes from './routes/alimentacionRoutes';
import medicacionRoutes from './routes/medicacionRoutes';
import adminRoutes from './routes/adminRoutes'
import residentesCuidadoresRoutes from  './routes/residentesCuidadoresRoutes'
import residentesFamiliaresRoutes from  './routes/residentesFamiliaresRoutes'
import reportsRoutes from './routes/reportRoutes';
import { handleError } from './utils/errorHandler';
import { initDatabase } from './config/initDb';
import {startWeeklyReportJob} from './jobs/reportJob'

// --- SOLUCIÓN: Paso 1 - Importar las rutas del chat ---
import chatRoutes from './routes/chatRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Registrar todas las rutas de la API ---
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/alimentacion', alimentacionRoutes);
app.use('/api/medicacion', medicacionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/residentesCuidadores', residentesCuidadoresRoutes);
app.use('/api/residentesFamiliares', residentesFamiliaresRoutes);
app.use('/api/reports',reportsRoutes);

startWeeklyReportJob();

startWeeklyReportJob();

// --- SOLUCIÓN: Paso 2 - Usar las rutas del chat con el prefijo /api/chat ---
app.use('/api/chat', chatRoutes);


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
      console.log(`Servidor corriendo en el puerto ${config.port}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

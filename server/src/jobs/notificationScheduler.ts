import cron from "node-cron";
import { Notificacion } from "../models/Notificacion";
import { sendNotification } from "../controllers/notificationController";
import { Op } from 'sequelize';

export const notificationScheduler = () => {
  cron.schedule('*/10 * * * * *', async () => {
    const now = Date.now();

    const dueNotis = await Notificacion.findAll({
      where: {
          fecha_programada: { [Op.lte]: now },
          leida: false,
      }
    })

    for (const notif of dueNotis) {
      await sendNotification(notif);
    }
  });
}
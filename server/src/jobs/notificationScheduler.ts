import cron from "node-cron";
import { Notificacion } from "../models/Notificacion";
import { sendNotification } from "../controllers/notificationController";

cron.schedule('*/10 * * * * *', async () => {
  const now = Date.now();

  const dueNotis = await Notificacion.findAll({
    where: {
        fecha_programada: { lte: now },
    }
  })

  for (const notif of dueNotis) {
    await sendNotification(notif);
  }
});
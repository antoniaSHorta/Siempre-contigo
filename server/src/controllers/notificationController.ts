import { Request, Response, NextFunction } from 'express';
import { addSeconds } from 'date-fns';
import { Notificacion } from '../models/Notificacion';
import { User } from '../models/User';
import { AppError } from '../utils/errorHandler';
import admin from 'firebase-admin';
import serviceAccount from '../firebase-credentials.json';

export const createNotification = async (titulo: string, contenido: string, destinatarios: User[], fecha_programada: Date = addSeconds(new Date(), 2) ) => {
    const notif = await Notificacion.create({
      fecha_programada: fecha_programada,
      titulo: titulo,
      contenido: contenido,
    });

    await notif.$set('destinatarios', destinatarios);

    // console.log(`Notificacion registrada '${titulo}' para ${fecha_programada}`)

    return notif;
}

export const createNotificationHttp = async (req: Request, res: Response, next: NextFunction) => {
  const { fecha, titulo, contenido, dstId } = req.body;

  try {
    const notificacion = await createNotification(fecha, titulo, contenido, dstId);

    res.status(201).json({
      success: true,
      data: notificacion,
      message: 'Notificacion creada exitosamente (sincronizada con agenda)'
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotification = async (id: number, titulo: string, contenido: string, destinatarios: User[], fecha_programada: Date) => {
  try {
    const notif = await Notificacion.findByPk(id);

    if (!notif) {
      console.error("Failed to find Notification");
      return;
    }

    await notif.update({
        titulo: titulo,
        contenido: contenido,
        destinatarios: destinatarios,
        fecha_programada: fecha_programada,
    });
  } catch (error) {
    console.error(error);
  }
}

export const sendNotification = async (notif: Notificacion) => {
  try {
    const destinatarios = await notif.$get('destinatarios');
    for (const user of destinatarios) {
      if (user) {
        if (user.fire_base_token) {
          firebaseNotification(user.fire_base_token, { title: notif.titulo, body: notif.contenido });
        } else {
          console.log("User doesn't have a firebase token");
        }
      }
    }

    await notif.update({ leida: true });

    console.log(`Notification ${notif.id} sent`);
  } catch (err) {
    console.error(`Failed to send notification ${notif.id}:`, err);
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
});

export const firebaseNotification = async (token: string, message: { title: string; body: string }) => {
  try {
    await admin.messaging().send({
      token: token,
      data: {
        title: message.title,
        body:  message.body,
        icon:  '/assets/logo.png',
      },
    });
  } catch (error) {
    console.error(error);
  }
};

export const registerFcmToken = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  const { token } = req.body;

  try {
    const user = await User.findByPk(userId);
    console.log(`${user} ${userId}`);

    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    await user.update({ fire_base_token: token });

    res.status(200).json({
      success: true,
      message: 'FCM token registrado exitosamente',
    });
  } catch (error) {
    next(error); 
  }
}
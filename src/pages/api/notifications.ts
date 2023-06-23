import * as admin from 'firebase-admin';

import { NextApiRequest, NextApiResponse } from 'next/types';
import { NotificationModel } from '../../models/model.notification';
import { sendNotificationsToUsers } from '../../models_helpers/notifications_helpers';
import { withAuth } from '../../_firebase/firebase_admin_auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { title, body, runAggregation } = req.body;
      if (!title || !body) throw new Error('Title and body must be provided');

      const db = admin.firestore();
      await db.collection('notifications').add({ title, body, timestampCreated: admin.firestore.FieldValue.serverTimestamp() });
      if (runAggregation) await apiAggregateNotifications();

      await sendNotificationsToUsers({ title: title, body: body });
      res.status(200).json({ message: 'Notification sent' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export async function apiGetAnnouncements(amt: number = 50) {
  try {
    const db = admin.firestore();
    const notifications = await db.collection('notifications').limit(amt).get();

    return notifications.docs.map((notifications) => {
      return NotificationModel.fromJson({ ...notifications.data(), id: notifications.id });
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function apiAggregateNotifications(): Promise<boolean> {
  try {
    const notifications = await apiGetAnnouncements(25);

    const data: NotificationModel[] = notifications.map((signal) => {
      return NotificationModel.toJson(signal);
    });

    data.sort((a, b) => {
      return b.timestampCreated!.getTime() - a.timestampCreated!.getTime();
    });

    const db = admin.firestore();
    await db
      .collection('notificationsAggr')
      .doc('notifications')
      .set({ data: data, timestampUpdated: admin.firestore.FieldValue.serverTimestamp() });

    return true;
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}

export default withAuth(handler);

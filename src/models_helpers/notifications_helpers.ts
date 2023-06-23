import * as admin from 'firebase-admin';
import { chunkArray } from './chunk_array';

interface INotification {
  title: string;
  body: string;
  tokens: string[] | string;
}

export async function sendNotificationsToUsers({ title, body }: { title: string; body: string }) {
  const db = admin.firestore();
  let tokens: string[] = [];
  try {
    const one_month_ago = new Date();
    // minus 30 days
    one_month_ago.setDate(one_month_ago.getDate() - 30);
    const one_month_ago_timestamp = admin.firestore.Timestamp.fromDate(one_month_ago);
    const users = await db.collection('users').where('timestampLastLogin', '>=', one_month_ago_timestamp).get();

    for (const user of users.docs) {
      const _tokens = user.data().devTokens;
      const _isNotificationsEnabled = user.data().isNotificationsEnabled;
      if (_tokens instanceof Array && _isNotificationsEnabled) tokens = [...tokens, ..._tokens];
    }

    // fix for double notifications
    console.log('tokens before filter: ', tokens.length);
    tokens = tokens.filter((token, index) => tokens.indexOf(token) === index);
    console.log('tokens after filter: ', tokens.length);

    await sendNotification({ title, body, tokens });
  } catch (error: any) {
    console.log('Error: ', error);
  }
}

export async function sendNotification({ title, body, tokens }: INotification) {
  if (!tokens) throw new Error('Tokens must not be less than 1');

  let devTokens = [];
  if (typeof tokens === 'string') devTokens.push(tokens);
  if (tokens instanceof Array) devTokens.push(...tokens);

  devTokens = devTokens.filter((to) => typeof to === 'string');
  devTokens = devTokens.filter((token) => token != '');

  const chunkedTokens = chunkArray(devTokens, 500);

  try {
    for (const chunk of chunkedTokens) {
      const messages = chunk.map((token) => {
        return {
          token,
          notification: { title, body }
        };
      });

      const r = await admin.messaging().sendAll(messages);

      if (r.failureCount > 0) {
        const failedTokens: any = [];
        r.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(messages[idx].token);
          }
        });
      }
    }
  } catch (error: any) {
    console.log('Error: ', error);
  }
}

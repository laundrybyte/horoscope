import horoscopeOn from './commands/horoscopeOn.js';
import horoscopeOff from './commands/horoscopeOff.js';
import weatherOn from './commands/weatherOn.js';
import weatherOff from './commands/weatherOff.js';
import remind from './commands/remind.js';
import listReminders from './commands/listReminders.js';
import clearReminders from './commands/clearReminders.js';
import { sendMessage } from './common.js';

const handleIncomingSms = async (req, res) => {
  try {
    const body = req?.body;

    if (body?.data?.event_type !== 'message.received') return res.json({ ok: true });
    console.log(body);

    const from = body?.data?.payload?.from?.phone_number;
    const text = body?.data?.payload?.text;

    console.log(`Received message "${text}" from ${from}.`);

    if (
      !from
      || !text
      || typeof from !== 'string'
      || typeof text !== 'string'
    ) return res.json({ ok: false, error: 'Could not determine from number or text.' });

    const validCommands = [
      '/help',
      '/horoscopeon',
      '/horoscopeoff',
      '/remindme5mins',
      '/remindme2hrs',
      '/remindme12hrs',
      '/remindme24hrs',
      '/remindme1week',
      '/listreminders',
      '/clearreminders',
      '/weatheron',
      '/weatheroff',
    ];

    const command = text?.split(' ')[0]?.toLowerCase();

    if (!validCommands.includes(command)) return res.json({ ok: false, error: 'Invalid command.' });

    const phone_number = parseInt(from?.replace('+', ''), 10);
    if (typeof phone_number !== 'number') return res.json({ ok: false, error: 'Unexpected phone number.' });

    if (command?.startsWith('/help')) {
      const help_message = 'use some of the commands below:\n\n'
        + '/horoscopeon scorpio\n/horoscopeoff\n/remindme5mins do something\n/remindme2hrs do something\n'
        + '/remindme12hrs do something\n/remindme24hrs do something\n/remindme1week do something\n'
        + '/listreminders\n/clearreminders';

      const resp = await sendMessage(`+${phone_number}`, help_message);
      if (resp) return res.json({ ok: true });
      return res.json({ ok: false, error: 'Failed to send message.' });
    }

    if (command?.startsWith('/remindme')) {
      const resp = await remind({ command, from: phone_number, text });
      if (resp) return res.json({ ok: true });
      return res.json({ ok: false, error: 'Failed to parse reminder.' });
    }

    if (command === '/horoscopeon') {
      const resp = await horoscopeOn({ from: phone_number, text });
      if (resp) return res.json({ ok: true });
      return res.json({ ok: false, error: 'Failed to parse horoscope.' });
    }

    if (command === '/horoscopeoff') {
      const resp = await horoscopeOff({ from: phone_number });
      if (resp) return res.json({ ok: true });
      return res.json({ ok: false, error: 'Failed to disable horoscope.' });
    }

    if (command === '/weatheron') {
      const resp = await weatherOn({ from: phone_number, text });
      if (resp) return res.json({ ok: true });
      return res.json({ ok: false, error: 'Failed to enable weather.' });
    }

    if (command === '/weatheroff') {
      const resp = await weatherOff({ from: phone_number });
      if (resp) return res.json({ ok: true });
      return res.json({ ok: false, error: 'Failed to disable weather.' });
    }

    if (command === '/listreminders') {
      const resp = await listReminders({ from: phone_number });
      if (resp) return res.json({ ok: true });
      return res.json({ ok: false, error: 'Failed to retrieve reminders.' });
    }

    if (command === '/clearreminders') {
      const resp = await clearReminders({ from: phone_number });
      if (resp) return res.json({ ok: true });
      return res.json({ ok: false, error: 'Failed to clear reminders.' });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.log(e);
    return res.json({ ok: false, error: 'Unexpected error.' });
  }
};

export default handleIncomingSms;

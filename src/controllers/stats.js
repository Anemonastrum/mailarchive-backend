import Inbox from '../models/inbox.js';
import Outbox from '../models/outbox.js';
import User from '../models/user.js';

// get total data tapi inboxnya aja blm jadi yahaha

export const getStats = async (req, res) => {
  try {
    const [inboxCount, outboxCount, userCount] = await Promise.all([
      Inbox.countDocuments(),
      Outbox.countDocuments(),
      User.countDocuments(),
    ]);

    const totalMail = inboxCount + outboxCount;

    res.status(200).json({
      inbox: inboxCount,
      outbox: outboxCount,
      users: userCount,
      totalMail,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', err });
  }
};

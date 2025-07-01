import Inbox from '../models/inbox.js';
import Outbox from '../models/outbox.js';
import User from '../models/user.js';

// get total data surat keluar, surat masuk, sama pengguna jadi satu

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

//get data per tahun inbox, outbox

export const getMonthlyLetterStats = async (req, res) => {
  try {
    const { year: paramYear } = req.params;
    const year = parseInt(paramYear) || new Date().getFullYear();

    const matchStage = {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01T00:00:00.000Z`),
          $lte: new Date(`${year}-12-31T23:59:59.999Z`)
        }
      }
    };

    const groupStage = {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 }
      }
    };

    const projectStage = {
      $project: {
        month: '$_id',
        count: 1,
        _id: 0
      }
    };

    const [inboxStats, outboxStats] = await Promise.all([
      Inbox.aggregate([matchStage, groupStage, projectStage]),
      Outbox.aggregate([matchStage, groupStage, projectStage])
    ]);

    const combined = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      inboxCount: 0,
      outboxCount: 0,
      total: 0
    }));

    inboxStats.forEach(({ month, count }) => {
      combined[month - 1].inboxCount = count;
      combined[month - 1].total += count;
    });

    outboxStats.forEach(({ month, count }) => {
      combined[month - 1].outboxCount = count;
      combined[month - 1].total += count;
    });

    res.status(200).json({
      message: 'ok',
      year,
      data: combined
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};


// get data outbox kategori total 

export const getOutboxStatsByCategory = async (req, res) => {
  try {
    const result = await Outbox.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      message: 'ok',
      totalCategories: result.length,
      data: result
    });

  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};

export const getTotalWaitingInbox = async (req, res) => {
  try {
    const waitCount = await Inbox.countDocuments({ status: 'wait' });

    res.status(200).json({
      message: 'ok',
      totalWaitingInbox: waitCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};


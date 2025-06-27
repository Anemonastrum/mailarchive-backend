import Inbox from '../models/inbox.js';

export const getDisposition = async (req, res) => {
  try {
    const { page = 1, limit = 10, origin, createdBy } = req.query;

    const query = { status: 'wait' };
    if (origin) query.origin = origin;
    if (createdBy) query.createdBy = createdBy;

    const skip = (page - 1) * limit;

    const [inboxes, total] = await Promise.all([
      Inbox.find(query)
        .select('recievedDate number origin summary attachment createdBy')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Inbox.countDocuments(query)
    ]);

    res.status(200).json({
      message: 'ok',
      data: inboxes,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalData: total,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};



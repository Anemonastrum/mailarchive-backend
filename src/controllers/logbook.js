import Inbox from '../models/inbox.js';
import Outbox from '../models/outbox.js';

export const getInboxList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {
      $and: [
        {
          $or: [
            { number: { $regex: search, $options: 'i' } },
            { origin: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { summary: { $regex: search, $options: 'i' } },
          ]
        },
        { status: 'done' }
      ]
    };

    const total = await Inbox.countDocuments(query);

    const inboxes = await Inbox.find(query)
      .select('number date summary origin attachment createdAt')
      .sort({ createdAt: -1 });

    const mapped = inboxes.map((doc) => ({
      type: 'inbox',
      _id: doc._id,
      number: doc.number,
      date: doc.date,
      summary: doc.summary,
      from: doc.origin,
      attachment: doc.attachment,
      attachmentUrls: doc.attachmentUrls,
      createdAt: doc.createdAt,
    }));

    // Apply pagination manually
    const start = (page - 1) * limit;
    const paginated = mapped.slice(start, start + limit);

    res.status(200).json({
      message: 'ok',
      inboxes: paginated,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};

export const getOutboxList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {
      $and: [
        {
          $or: [
            { number: { $regex: search, $options: 'i' } },
            { destination: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { summary: { $regex: search, $options: 'i' } },
            { sign: { $regex: search, $options: 'i' } },
          ]
        },
        { status: 'done' }
      ]
    };

    const total = await Outbox.countDocuments(query);

    const outboxes = await Outbox.find(query)
      .select('number date summary destination attachment attachmentUrls createdAt')
      .sort({ createdAt: -1 });

    const mapped = outboxes.map(doc => ({
      type: 'outbox',
      _id: doc._id,
      number: doc.number,
      date: doc.date,
      summary: doc.summary,
      from: doc.destination,
      attachment: doc.attachment,
      attachmentUrls: doc.attachmentUrls,
      createdAt: doc.createdAt,
    }));

    const start = (page - 1) * limit;
    const paginated = mapped.slice(start, start + limit);

    res.status(200).json({
      message: 'ok',
      outboxes: paginated,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};

export const getAllDocumentsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const inboxQuery = {
      $and: [
        {
          $or: [
            { number: { $regex: search, $options: 'i' } },
            { origin: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { summary: { $regex: search, $options: 'i' } },
          ]
        },
        { status: 'done' } // Only include inboxes that are marked as done
      ]
    };

    const outboxQuery = {
      $and: [
        {
          $or: [
            { number: { $regex: search, $options: 'i' } },
            { destination: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { summary: { $regex: search, $options: 'i' } },
          ]
        },
        { status: 'done' } // Only include inboxes that are marked as done
      ]
    };

    // Fetch and select only relevant fields
    const [inboxes, outboxes] = await Promise.all([
      Inbox.find(inboxQuery)
        .select('number date summary origin attachment createdAt')
        .sort({ createdAt: -1 }),
      Outbox.find(outboxQuery)
        .select('number date summary destination attachment createdAt')
        .sort({ createdAt: -1 }),
    ]);

    const combined = [
      ...inboxes.map(doc => ({
        type: 'inbox',
        _id: doc._id,
        number: doc.number,
        date: doc.date,
        summary: doc.summary,
        from: doc.origin,
        attachmentUrls: doc.attachmentUrls,
        attachment: doc.attachment,
        createdAt: doc.createdAt,
      })),
      ...outboxes.map(doc => ({
        type: 'outbox',
        _id: doc._id,
        number: doc.number,
        date: doc.date,
        summary: doc.summary,
        from: doc.destination,
        attachmentUrls: doc.attachmentUrls,
        attachment: doc.attachment,
        createdAt: doc.createdAt,
      })),
    ];

    // Sort by creation date
    const sorted = combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const total = sorted.length;
    const start = (page - 1) * limit;
    const paginated = sorted.slice(start, start + limit);

    res.status(200).json({
      message: 'ok',
      documents: paginated,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', err });
  }
};

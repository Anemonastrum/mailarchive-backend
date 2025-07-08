import express from 'express';
import { getInboxList, getOutboxList, getAllDocumentsList, getAllDocumentsWait } from '../controllers/logbook.js';

const router = express.Router();

router.get('/inbox', getInboxList);
router.get('/outbox', getOutboxList);
router.get('/all', getAllDocumentsList);

router.get('/wait', getAllDocumentsWait);





export default router;

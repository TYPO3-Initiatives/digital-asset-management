const CHUNK_SIZE = 1048576;
const ChunkActiveUploads: any = {};

const chunkUploadStart = (req: XMLHttpRequest, res: any) => {
  const uuid = Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  ChunkActiveUploads[uuid] = {};

  return res.json({
    status: 'success',
    data: {
      session_id: uuid,
      start_offset: 0,
      end_offset: CHUNK_SIZE,
    },
  });
};

const chunkUploadPart = (req: XMLHttpRequest, res: any) => {
  setTimeout(() => {
    const rand = Math.random();
    if (rand <= 0.25) {
      res.status(500);
      res.json({ status: 'error', error: 'server' });
    } else {
      res.send({ status: 'success' });
    }
  },         100 + parseInt(String(Math.random() * 2000), 10));
};

const chunkUploadFinish = (req: XMLHttpRequest, res: any) => {
  setTimeout(() => {
    const rand = Math.random();
    if (rand <= 0.25) {
      res.status(500);
      res.json({ status: 'error', error: 'server' });
    } else {
      res.send({ status: 'success' });
    }
  },         100 + parseInt(String(Math.random() * 2000), 10));
};

module.exports = (req: XMLHttpRequest, res: any) => {
  // @ts-ignore
  const body = req.body;
  if (!body.phase) {
    return chunkUploadPart(req, res);
  }

  if (body.phase === 'start') {
    return chunkUploadStart(req, res);
  } else if (body.phase === 'upload') {
    return chunkUploadPart(req, res);
  } else if (body.phase === 'finish') {
    return chunkUploadFinish(req, res);
  }
};

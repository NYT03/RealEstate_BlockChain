const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

router.post('/add', async (req, res) => {
  const newProp = new Property(req.body);
  await newProp.save();
  res.send({ success: true });
});

router.get('/all', async (req, res) => {
  const props = await Property.find();
  res.json(props);
});

router.post('/delete', async (req, res) => {
  const { propertyId, owner } = req.body;
  const prop = await Property.findOne({ propertyId });

  if (prop && prop.owner.toLowerCase() === owner.toLowerCase()) {
    await Property.deleteOne({ propertyId });
    return res.send({ success: true });
  }

  res.send({ success: false, error: 'Unauthorized' });
});

module.exports = router;

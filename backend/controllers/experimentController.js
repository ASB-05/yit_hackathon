const Experiment = require('../models/Experiment');

exports.createExperiment = async (req, res) => {
  try {
    const { key, course, description, variants } = req.body;
    const exp = new Experiment({ key, course, description, variants });
    await exp.save();
    res.json(exp);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.assignVariant = async (req, res) => {
  try {
    const { key } = req.params;
    const exp = await Experiment.findOne({ key, active: true });
    if (!exp) return res.status(404).json({ msg: 'Experiment not found' });
    // simple random weighted assignment
    const r = Math.random();
    let acc = 0;
    let variant = exp.variants[0]?.key;
    for (const v of exp.variants) {
      acc += v.weight;
      if (r <= acc) {
        variant = v.key;
        break;
      }
    }
    exp.assignments.push({ user: req.user.id, variantKey: variant });
    await exp.save();
    res.json({ variant });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};



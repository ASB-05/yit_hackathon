// very simple in-memory rate limit (per IP per path)
const buckets = new Map();

module.exports = function rateLimit(options = {}) {
  const windowMs = options.windowMs || 60 * 1000;
  const max = options.max || 120;
  return function (req, res, next) {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const entry = buckets.get(key) || { count: 0, reset: now + windowMs };
    if (now > entry.reset) {
      entry.count = 0;
      entry.reset = now + windowMs;
    }
    entry.count += 1;
    buckets.set(key, entry);
    if (entry.count > max) {
      return res.status(429).json({ msg: 'Too many requests' });
    }
    next();
  };
};



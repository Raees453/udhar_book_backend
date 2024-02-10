module.exports = (err, req, res, next) => res.status(500).json({
  'status': false, 'message': 'Some error occurred',
});

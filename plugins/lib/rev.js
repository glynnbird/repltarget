const incrementRev = function(rev) {
  if (!rev) {
    return '0-1';
  }
  const bits = rev.split('-');
  bits[1] = (parseInt(bits[1]) + 1).toString();
  return bits.join('-');
};

module.exports = {
  incrementRev: incrementRev
};
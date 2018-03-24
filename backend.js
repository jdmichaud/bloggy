module.exports = {
  '/?': (req, res) => {
    // Retrieve all README.md from gist server
    // Build index
    // Return index
    console.log('building index');
    res.send('OK');
  },
};

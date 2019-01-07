// Filename: api-routes.js
// Initialize express router
let router = require('express').Router();
// Set default API response
router.get('/test', function (req, res) {
    res.json(
        [      {
            id: 'Game1',
            description: 'this is game 1',
          },
          {
            id: 'Game2',
            description: 'this is game 2',
          },
          {
            id: 'Game3',
            description: 'this is game 3',
          },
    ]
    );
});
// Export API routes
module.exports = router;
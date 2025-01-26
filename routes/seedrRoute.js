
const express = require('express');
const router = express.Router();
const SeedrController = require('../controllers/seedrController');

const seedrController = new SeedrController();

router.post('/api/login', (req, res) => seedrController.login(req, res));

router.get('/api/getaff', (req, res) => seedrController.getAFF(req, res));
router.get('/api/file', (req, res) => seedrController.getFile(req, res));
router.post('/api/magnet', (req, res) => seedrController.addMagnet(req, res));
router.delete('/api/file', (req, res) => seedrController.deleteFile(req, res));
router.delete('/api/folder', (req, res) => seedrController.deleteFolder(req, res));
router.get('/api/device-code', (req, res) => seedrController.getDeviceCode(req, res));
router.get('/api/token', (req, res) => seedrController.getToken(req, res));
router.post('/api/token', (req, res) => seedrController.addToken(req, res));

module.exports = router;

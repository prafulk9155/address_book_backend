const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const contactApi = require('../apis/contact');


router.get('/contacts', (req, res) => {
    const sql = 'SELECT * FROM contacts';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
});


router.post('/add', contactApi.add_contact);
router.post('/list', contactApi.get_list);
router.post('/update', contactApi.update_contact);
router.post('/getDataByID', contactApi.get_data_by_id);
router.post('/delete', contactApi.in_active_contact);
router.post('/getGroup', contactApi.get_group_type);

module.exports = router;

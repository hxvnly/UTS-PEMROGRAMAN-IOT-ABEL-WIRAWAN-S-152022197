const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Koneksi ke MySQL Database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hidroponik'
});

db.connect((err) => {
    if (err) {
        console.error('Gagal terhubung ke database:', err);
    } else {
        console.log('Terhubung ke database MySQL');
    }
});

// Static data (keeps your original data intact)
const staticData = {
    suhu_min: 20,
    suhu_max: 28,
    kelembapan_min: 25,
    kelembapan_max: 75,
    ideal_suhu_max_humid_max: {
        suhu: 26,
        humid: 70,
        hum_log: [
            { hum: 65, suhu: 27, date: "2024-11-07 00:00:00" },
            { hum: 63, suhu: 28, date: "2024-11-08 00:00:00" }
        ]
    },
    time_now: "2024-11-12 14:52:33",
    log: [
        { id: 1, suhu: 26, humid: 70, date: "2024-11-07 14:52:33" },
        { id: 2, suhu: 27, humid: 72, date: "2024-11-08 14:52:33" }
    ],
    month_year_max: [
        { month: 9, year: 2024 }
    ]
};

// Endpoint untuk mendapatkan data JSON
app.get('/data', (req, res) => {
    // Get data from MySQL
    db.query('SELECT * FROM sensor_data ORDER BY waktu DESC', (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Gagal mengambil data' });
        } else {
            // Combine MySQL data with static data
            const responseData = {
                ...staticData,
                sensor_data: results // Include data from the MySQL database
            };
            res.json(responseData); // Send combined data as response
        }
    });
});

// Endpoint untuk menerima data dari frontend dan menyimpannya ke database
app.post('/add-data', (req, res) => {
    const { suhu, kelembapan, kecerahan } = req.body;

    if (!suhu || !kelembapan || !kecerahan) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    const query = 'INSERT INTO sensor_data (suhu, kelembapan, kecerahan) VALUES (?, ?, ?)';
    db.query(query, [suhu, kelembapan, kecerahan], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Gagal menyimpan data' });
        } else {
            res.status(200).json({ message: 'Data berhasil disimpan' });
        }
    });
});

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

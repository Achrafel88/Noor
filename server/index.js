const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: '127.0.0.1',
  port: 8889,
  user: 'root',
  password: 'root',
  database: 'quranapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = db.promise();

// --- API ROUTES ---

app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  try {
    await promisePool.execute(
      'INSERT INTO users (id, name, email, password, personal_progress) VALUES (?, ?, ?, ?, 0)',
      [id, name, email, password]
    );
    res.json({ id, name, email, personalProgress: 0 });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json(err);
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [results] = await promisePool.execute('SELECT id, name, email, personal_progress as personalProgress FROM users WHERE email = ? AND password = ?', [email, password]);
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    const user = results[0];
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/api/personal-progress', async (req, res) => {
  const { userId, progress } = req.body;
  try {
    await promisePool.execute('UPDATE users SET personal_progress = ? WHERE id = ?', [progress, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/api/circles', async (req, res) => {
  const { name, leaderId } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  const code = Math.random().toString(36).toUpperCase().substr(2, 6);
  try {
    await promisePool.execute('INSERT INTO circles (id, name, code, leader_id) VALUES (?, ?, ?, ?)', [id, name, code, leaderId]);
    await promisePool.execute('INSERT INTO members (circle_id, user_id) VALUES (?, ?)', [id, leaderId]);
    res.json({ id, name, code, leader_id: leaderId });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/api/join', async (req, res) => {
  const { code, userId } = req.body;
  try {
    const [results] = await promisePool.execute('SELECT id FROM circles WHERE code = ?', [code]);
    if (results.length === 0) return res.status(404).json({ message: 'Circle not found' });
    const circleId = results[0].id;
    await promisePool.execute('INSERT INTO members (circle_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE user_id = user_id', [circleId, userId]);
    res.json({ success: true, circleId });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/api/progress', async (req, res) => {
  let { circleId, userId, hizbNum, readAyahs, totalAyahs, lastRead } = req.body;
  if (!circleId || !userId || !hizbNum) return res.status(400).json({ message: 'Missing parameters' });
  
  try {
    // If totalAyahs is missing, try to fetch it from Al Quran Cloud
    if (!totalAyahs || totalAyahs === 0) {
      try {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const resp = await fetch(`https://api.alquran.cloud/v1/hizb/${hizbNum}/quran-uthmani`);
        const data = await resp.json();
        totalAyahs = data.data?.ayahs?.length || 100; // Fallback to 100 if both fail
      } catch (e) {
        totalAyahs = 100;
      }
    }

    const progressPercent = totalAyahs > 0 ? Math.round((readAyahs / totalAyahs) * 100) : 0;
    const status = (readAyahs >= totalAyahs && totalAyahs > 0) ? 'completed' : 'pending';

    // 1. Check if this Hizb is already assigned to someone else in this circle
    if (readAyahs === 0) {
      const [existing] = await promisePool.execute(
        'SELECT user_id FROM assignments WHERE circle_id = ? AND hizb_number = ? AND user_id != ?',
        [circleId, hizbNum, userId]
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Hizb is already assigned to another member' });
      }
    }

    const lAyah = lastRead?.ayah ?? null;
    const lSurah = lastRead?.surah ?? null;
    const lName = lastRead?.name ?? null;
    const lPage = lastRead?.page ?? null;

    // 2. Update/Insert assignment
    await promisePool.execute(
      `INSERT INTO assignments (circle_id, user_id, hizb_number, read_ayahs, total_ayahs, status, last_read_ayah, last_read_surah, last_read_surah_name, last_read_page) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE read_ayahs = ?, total_ayahs = ?, status = ?, last_read_ayah = ?, last_read_surah = ?, last_read_surah_name = ?, last_read_page = ?, hizb_number = ?`,
      [
        circleId, userId, hizbNum, readAyahs, totalAyahs, status, lAyah, lSurah, lName, lPage,
        readAyahs, totalAyahs, status, lAyah, lSurah, lName, lPage, hizbNum
      ]
    );

    // 3. Update member total progress in that circle
    await promisePool.execute('UPDATE members SET progress = ? WHERE circle_id = ? AND user_id = ?', [progressPercent, circleId, userId]);
    
    // 4. Check if Khatmah is complete
    const [completedHizbs] = await promisePool.execute(
      "SELECT COUNT(*) as count FROM assignments WHERE circle_id = ? AND status = 'completed'",
      [circleId]
    );

    if (completedHizbs[0].count >= 60) {
      await promisePool.execute('UPDATE circles SET khatmat_count = khatmat_count + 1 WHERE id = ?', [circleId]);
      await promisePool.execute('DELETE FROM assignments WHERE circle_id = ?', [circleId]);
      await promisePool.execute('UPDATE members SET progress = 0 WHERE circle_id = ?', [circleId]);
      return res.json({ success: true, khatmahComplete: true });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Progress update error:", err);
    res.status(500).json({ message: 'Database error', error: err.message });
  }
});

app.post('/api/personal-last-read', async (req, res) => {
  const { userId, surah, ayah, name, page } = req.body;
  try {
    await promisePool.execute(
      `INSERT INTO last_read (user_id, surah_num, ayah_num, surah_name, page_num) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE surah_num = ?, ayah_num = ?, surah_name = ?, page_num = ?`,
      [userId, surah, ayah, name, page, surah, ayah, name, page]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get('/api/user-data/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [uResults] = await promisePool.execute('SELECT personal_progress as personalProgress FROM users WHERE id = ?', [userId]);
    const personalProgress = uResults.length > 0 ? uResults[0].personalProgress : 0;

    const [lastRead] = await promisePool.execute('SELECT * FROM last_read WHERE user_id = ?', [userId]);
    const [circles] = await promisePool.execute(
      `SELECT c.* FROM circles c JOIN members m ON c.id = m.circle_id WHERE m.user_id = ?`,
      [userId]
    );

    const enrichedCircles = [];
    for (const circle of circles) {
      const [members] = await promisePool.execute(
        `SELECT u.id, u.name, m.progress FROM members m 
         JOIN users u ON m.user_id = u.id 
         WHERE m.circle_id = ?`,
        [circle.id]
      );
      
      const [assignments] = await promisePool.execute(
        `SELECT a.*, u.name as memberName FROM assignments a 
         JOIN users u ON a.user_id = u.id 
         WHERE a.circle_id = ?`,
        [circle.id]
      );
      
      enrichedCircles.push({
        ...circle,
        leaderId: circle.leader_id,
        khatmatCount: circle.khatmat_count,
        members: members || [],
        assignments: (assignments || []).map(a => ({
          memberId: a.user_id,
          memberName: a.memberName,
          hizbNumber: a.hizb_number,
          totalAyahs: a.total_ayahs,
          readAyahs: a.read_ayahs,
          status: a.status,
          lastReadAyah: a.last_read_ayah,
          lastReadSurah: a.last_read_surah,
          lastReadSurahName: a.last_read_surah_name,
          lastReadPage: a.last_read_page
        }))
      });
    }

    res.json({ 
      personalProgress,
      circles: enrichedCircles, 
      lastRead: lastRead.length > 0 ? {
        surah: lastRead[0].surah_num,
        ayah: lastRead[0].ayah_num,
        name: lastRead[0].surah_name,
        page: lastRead[0].page_num
      } : null
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post('/api/leave', async (req, res) => {
  const { circleId, userId, newLeaderId } = req.body;
  try {
    if (newLeaderId) {
      await promisePool.execute('UPDATE circles SET leader_id = ? WHERE id = ?', [newLeaderId, circleId]);
    }
    await promisePool.execute('DELETE FROM members WHERE circle_id = ? AND user_id = ?', [circleId, userId]);
    await promisePool.execute('DELETE FROM assignments WHERE circle_id = ? AND user_id = ?', [circleId, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

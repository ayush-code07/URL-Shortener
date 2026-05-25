const express = require('express')
const app = express()
const { rateLimit } = require('express-rate-limit')
const dotenv = require('dotenv')
const path = require('path')
const db = require('./db')
const { access } = require('fs')

app.use(express.urlencoded({ extended: true }))
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100
})

dotenv.config()
// app.use(limiter)

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.port || 3000

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/shorten', async (req, res) => {
    // Logic to shorten the URL will go here
    const originalUrl = req.body.url;

    try {
        const [rows] = await db.execute('SELECT shortCode FROM urls WHERE url = ?', [originalUrl]);
        if (rows.length > 0) {
            const fullUrl = req.protocol + '://' + req.get('host') + '/shorten/' + rows[0].shortCode;
            res.render('shortenedURL', { shortCode: rows[0].shortCode, fullUrl: fullUrl });
        }
        else {
            const shortCode = Math.random().toString(36).substring(2, 8);
            
            await db.execute('INSERT INTO urls (url, shortCode, createdAt, updatedAt, accessCount) VALUES (?, ?, ?, ?, ?)', [originalUrl, shortCode, new Date(), new Date(), 0]);
            // res.render('shortenedURL', { shortCode });
            const fullUrl = req.protocol + '://' + req.get('host') + '/shorten/' + shortCode;
            res.render('shortenedURL', { shortCode, fullUrl });
        }
    } catch (error) {
        console.error(error);
        res.status(400).send('Bad Request');
    }
})

app.get('/shorten/:code', async (req, res) => {
    const shortCode = req.params.code;
    try {
        const [rows] = await db.execute('SELECT url FROM urls WHERE shortCode = ?', [shortCode]);
        await db.execute('UPDATE urls SET accessCount = accessCount + 1 WHERE shortCode = ?', [shortCode]);
        if (rows.length > 0) {
            let targetUrl = rows[0].url;

            // Check if the URL starts with http:// or https://
            if (!/^https?:\/\//i.test(targetUrl)) {
                targetUrl = 'https://' + targetUrl;
            }

            res.redirect(targetUrl);
        } else {
            res.status(404).send('URL not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})

app.put('/shorten/:code', async (req, res) => {
    const shortCode = req.params.code;
    const newUrl = req.body.newURL;

    console.log("Updating URL:", { shortCode, newUrl });
    try {
        const [result] = await db.execute('UPDATE urls SET url = ?, updatedAt = ? WHERE shortCode = ?', [newUrl, new Date(), shortCode]);
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'URL updated successfully' });
        } else {
            res.status(404).send('URL not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})

app.delete('/shorten/:code', async (req, res) => {
    const shortCode = req.params.code;

    try {
        await db.execute('DELETE FROM urls WHERE shortCode = ?', [shortCode]);
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})

app.get('/shorten/:code/stats', async (req, res) => {
    const shortCode = req.params.code;
    try {
        const [rows] = await db.execute('SELECT url, createdAt, updatedAt, accessCount FROM urls WHERE shortCode = ?', [shortCode]);
        if(rows.length > 0){
            res.render('stats', {
                url: rows[0].url,
                shortCode: shortCode,
                createdAt: rows[0].createdAt,
                updatedAt: rows[0].updatedAt,
                accessCount: rows[0].accessCount
            })
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
})

app.listen(port, () => {
    console.log("Server is running")
})
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'supersecretbeta2026';
const BETA_CODE = 'BETA2026';

app.post('/api/register', async (req, res) => {
    const { email, password, betaCode } = req.body;

    if (!email || !password || !betaCode) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (betaCode !== BETA_CODE) {
        return res.status(403).json({ error: 'Code beta invalide' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Cet email est déjà utilisé' });
                }
                return res.status(500).json({ error: 'Erreur lors de la création du compte' });
            }
            res.status(201).json({ message: 'Inscription réussie' });
        });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Identifiants invalides' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, email: user.email });
    });
});


app.get('/api/scrape', async (req, res) => {
    const { query, location, limit, token } = req.query;

    if (!token) {
        return res.status(401).json({ error: 'Non autorisé' });
    }

    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    if (!query || !location) {
        return res.status(400).json({ error: 'Query and location are required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (type, data) => {
        res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
    };

    let browser;
    try {
        console.log(`Starting scrape for: ${query} in ${location}`);
        sendEvent('progress', 5);

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=fr-FR']
        });
        const page = await browser.newPage();

        // Set a reasonable viewport
        await page.setViewport({ width: 1280, height: 800 });

        const searchQuery = encodeURIComponent(`${query} in ${location}`);
        const url = `https://www.google.fr/maps/search/${searchQuery}?hl=fr`;
        console.log(`Navigating to: ${url}`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        sendEvent('progress', 10);

        // Handle cookie consent popup if it appears
        try {
            const consentButton = await page.$('button[aria-label="Tout accepter"], button[aria-label="Accept all"]');
            if (consentButton) {
                console.log('Accepting cookies...');
                await consentButton.click();
                await page.waitForTimeout(2000);
            }
        } catch (e) {
            console.log('No cookie popup found');
        }

        // Wait for results container
        console.log('Waiting for results...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        const results = [];

        // We will extract up to limit elements
        const maxResults = limit ? parseInt(limit) : 5;

        // Scroll the results container to load more items if needed
        let loadedElementsCount = 0;
        let scrollAttempts = 0;
        let lastLoadedCount = 0;
        let noNewItemsAttempts = 0;

        while (loadedElementsCount < maxResults && scrollAttempts < 100 && noNewItemsAttempts < 5) {
            loadedElementsCount = await page.evaluate(() => document.querySelectorAll('a[href*="/maps/place/"]').length);
            if (loadedElementsCount >= maxResults) break;

            if (loadedElementsCount === lastLoadedCount) {
                noNewItemsAttempts++;
            } else {
                noNewItemsAttempts = 0;
            }
            lastLoadedCount = loadedElementsCount;

            await page.evaluate(() => {
                const items = document.querySelectorAll('a[href*="/maps/place/"]');
                if (items.length > 0) {
                    items[items.length - 1].scrollIntoView();
                }
                const feed = document.querySelector('div[role="feed"]');
                if (feed) feed.scrollBy(0, 10000);
            });
            // Wait for new items to load
            await new Promise(r => setTimeout(r, 2000));
            scrollAttempts++;
            sendEvent('progress', 10 + Math.floor((loadedElementsCount / maxResults) * 10)); // max 20%
        }

        console.log(`Loaded ${loadedElementsCount} items in list. Extracting up to ${maxResults}...`);

        // Gather all links and names
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a[href*="/maps/place/"]')).map(el => ({
                name: el.getAttribute('aria-label'),
                url: el.href
            }));
        });

        // Loop through the collected links with concurrency
        const linksToExtract = links.filter(l => l.name && l.url).slice(0, maxResults);
        const CONCURRENCY = 5;
        let extractedCount = 0;

        for (let i = 0; i < linksToExtract.length; i += CONCURRENCY) {
            const batch = linksToExtract.slice(i, i + CONCURRENCY);

            await Promise.all(batch.map(async (place) => {
                console.log(`Extracting: ${place.name}`);

                try {
                    const newPage = await browser.newPage();
                    await newPage.goto(place.url, { waitUntil: 'networkidle2', timeout: 30000 });

                    const details = await newPage.evaluate(() => {
                        let phone = 'Non renseigné';
                        let website = 'Non renseigné';
                        let adresse = 'Non renseigné';

                        // Try to find phone
                        const phoneBtn = document.querySelector('button[data-tooltip*="téléphone"], button[data-item-id*="phone:"]');
                        if (phoneBtn) {
                            const textElement = phoneBtn.querySelector('.fontBodyMedium') || phoneBtn;
                            phone = textElement.innerText || phoneBtn.getAttribute('aria-label') || 'Trouvé';
                            if (phone.includes('Numéro de téléphone')) {
                                phone = phone.replace('Numéro de téléphone: ', '').trim();
                            }
                        }

                        // Try to find website
                        const webBtn = document.querySelector('a[data-item-id="authority"], a[data-tooltip*="site Web"]');
                        if (webBtn) {
                            website = webBtn.getAttribute('href');
                        }

                        // Try to find address
                        const addressBtn = document.querySelector('button[data-item-id="address"], button[data-tooltip*="Copier l\'adresse"], a[data-item-id="address"], a[data-tooltip*="Copier l\'adresse"]');
                        if (addressBtn) {
                            adresse = addressBtn.getAttribute('aria-label') || addressBtn.innerText || 'Trouvé';
                            if (adresse.includes('Adresse: ')) adresse = adresse.replace('Adresse: ', '').trim();
                            else if (adresse.includes('Adresse : ')) adresse = adresse.replace('Adresse : ', '').trim();
                        }

                        return { phone, website, adresse };
                    });

                    extractedCount++;
                    const resultItem = {
                        id: extractedCount,
                        name: place.name,
                        phone: details.phone,
                        website: details.website,
                        adresse: details.adresse,
                        email: 'Nécessite de visiter le site',
                        status: 'Extracted'
                    };

                    sendEvent('result', resultItem);
                    sendEvent('progress', 20 + Math.floor((extractedCount / linksToExtract.length) * 80));

                    await newPage.close();

                } catch (err) {
                    console.log(`Error extracting ${place.name}:`, err.message);
                }
            }));
        }

        console.log(`Finished extraction. Found ${extractedCount} results.`);
        await browser.close();
        sendEvent('done', true);
        res.end();

    } catch (error) {
        console.error('Scraping error:', error);
        if (browser) await browser.close();
        sendEvent('error', error.message);
        res.end();
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});

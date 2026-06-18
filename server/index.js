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

// Helper function to block heavy assets (images, fonts, videos)
const optimizePage = async (page) => {
    try {
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['image', 'media', 'font'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });
    } catch (e) {
        console.log('Error setting up request interception:', e.message);
    }
};

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
    const { query, location, limit, token, lat, lng, zoom } = req.query;

    if (!token) {
        return res.status(401).json({ error: 'Non autorisé' });
    }

    try {
        jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    if (!query || (!location && (!lat || !lng))) {
        return res.status(400).json({ error: 'Query and location (or coordinates) are required' });
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
        const hasCoords = lat && lng;
        if (hasCoords) {
            console.log(`Starting optimized scrape for: ${query} around coords: ${lat}, ${lng} (zoom ${zoom || 15})`);
        } else {
            console.log(`Starting optimized scrape for: ${query} in ${location}`);
        }
        sendEvent('progress', 5);

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--lang=fr-FR']
        });
        const page = await browser.newPage();
        
        // Optimizing the main scraping page by blocking heavy assets
        await optimizePage(page);

        // Set a reasonable viewport
        await page.setViewport({ width: 1280, height: 800 });

        let url;
        if (hasCoords) {
            const zoomVal = zoom || 15;
            url = `https://www.google.fr/maps/search/${encodeURIComponent(query)}/@${lat},${lng},${zoomVal}z?hl=fr`;
        } else {
            const searchQuery = encodeURIComponent(`${query} in ${location}`);
            url = `https://www.google.fr/maps/search/${searchQuery}?hl=fr`;
        }
        console.log(`Navigating to: ${url}`);

        // Navigate with domcontentloaded for instant reaction
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        sendEvent('progress', 10);

        // Handle cookie consent popup if it appears
        try {
            const consentButton = await page.$('button[aria-label="Tout accepter"], button[aria-label="Accept all"]');
            if (consentButton) {
                console.log('Accepting cookies...');
                await consentButton.click();
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (e) {
            console.log('No cookie popup found');
        }

        // Wait dynamically for results container or at least one link
        console.log('Waiting for results...');
        try {
            await page.waitForSelector('a[href*="/maps/place/"]', { timeout: 15000 });
        } catch (e) {
            console.log('Timeout waiting for initial place links. Continuing...');
        }

        const results = [];

        // We will extract up to limit elements
        const maxResults = limit ? parseInt(limit) : 5;

        // Scroll the results container to load more items if needed
        let loadedElementsCount = 0;
        let scrollAttempts = 0;
        let lastLoadedCount = 0;
        let noNewItemsAttempts = 0;

        // Optimized scrolling delay from 2s to 1s
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
            // Wait for new items to load - optimized to 1000ms
            await new Promise(r => setTimeout(r, 1000));
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
                    // Optimizing detail page by blocking heavy assets
                    await optimizePage(newPage);

                    // Instant page load waiting only for DOM structure
                    await newPage.goto(place.url, { waitUntil: 'domcontentloaded', timeout: 30000 });

                    // Wait specifically for the main title to render
                    try {
                        await newPage.waitForSelector('h1.DUwDvf', { timeout: 6000 });
                    } catch (e) {
                        console.log(`Timeout waiting for heading on ${place.name}, proceeding with fallback...`);
                    }

                    const details = await newPage.evaluate(() => {
                        let phone = 'Non renseigné';
                        let website = 'Non renseigné';
                        let adresse = 'Non renseigné';
                        let note = 'Non renseigné';
                        let ouverture = 'Non renseigné';

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

                        // Try to find note
                        const noteDiv = document.querySelector('div.F7nice span[aria-hidden="true"]');
                        if (noteDiv && noteDiv.innerText.trim().length > 0) {
                            note = noteDiv.innerText.trim();
                        } else {
                            const noteAria = document.querySelector('span[role="img"][aria-label*="étoile"], span[role="img"][aria-label*="star"], div[role="img"][aria-label*="étoile"], div[role="img"][aria-label*="star"]');
                            if (noteAria) {
                                const ariaLabel = noteAria.getAttribute('aria-label');
                                const match = ariaLabel.match(/[\d,.]+/);
                                if (match) note = match[0];
                            } else {
                                const noteBtn = document.querySelector('button[data-item-id="reviews-sort-button-group-button-0"], button[data-tooltip*="Note"]');
                                if (noteBtn) {
                                    note = noteBtn.getAttribute('aria-label') || noteBtn.innerText || 'Trouvé';
                                    if (note.includes('Note: ')) note = note.replace('Note: ', '').trim();
                                    else if (note.includes('Note : ')) note = note.replace('Note : ', '').trim();
                                }
                            }
                        }

                        // Try to find ouverture
                        const hoursElem = document.querySelector('div[data-item-id="oh"], button[data-item-id="oh"]');
                        if (hoursElem) {
                            const text = hoursElem.innerText || '';
                            if (text.includes('Ouvert 24h/24')) ouverture = 'Ouvert 24h/24';
                            else if (text.includes('Ouvert')) ouverture = 'Ouvert';
                            else if (text.includes('Fermé')) ouverture = 'Fermé';
                        } else {
                            const spans = Array.from(document.querySelectorAll('span'));
                            const statusSpan = spans.find(s => s.innerText && (s.innerText.startsWith('Ouvert') || s.innerText.startsWith('Fermé')));
                            if (statusSpan) {
                                if (statusSpan.innerText.includes('Ouvert 24h/24')) ouverture = 'Ouvert 24h/24';
                                else if (statusSpan.innerText.includes('Ouvert')) ouverture = 'Ouvert';
                                else if (statusSpan.innerText.includes('Fermé')) ouverture = 'Fermé';
                            }
                        }

                        return { phone, website, adresse, note, ouverture };
                    });

                    extractedCount++;
                    const resultItem = {
                        id: extractedCount,
                        name: place.name,
                        phone: details.phone,
                        website: details.website,
                        adresse: details.adresse,
                        note: details.note,
                        ouverture: details.ouverture,
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

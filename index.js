const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const yup = require('yup');
const { nanoid } = require('nanoid');
const { default: monk } = require('monk');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const path = require('path');
const bodyParser = require('body-parser');

require('dotenv').config()

const db = monk(process.env.MONGO_URL);
const urls = db.get('urls');
urls.createIndex({ slug: 1 }, { unique: true });

const app = express();
app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(morgan('common'))
app.use(helmet());
app.use(express.json());

app.get('/:id', async (req, res, next) => {
    const { id: slug } = req.params;
    try {
        const url = await urls.findOne({ slug });
        if (url) {
            return res.redirect(url.url);
        }
        return res.redirect('/')
    } catch (error) {
        return res.redirect('/')
    }
})

const schema = yup.object().shape({
    slug: yup.string().trim().matches(/[\w\-]/i),
    url: yup.string().trim().url().required(),
})

app.post('/url'
    , slowDown({
        windowMs: 30 * 1000,
        delayAfter: 1,
        delayMs: 500,
    }), rateLimit({
        windowMs: 30 * 1000,
        max: 15,
    })
    , async (req, res, next) => {
        let { slug, url } = req.body
        try {
            await schema.validate({
                slug, url
            })
            if (!slug) {
                slug = nanoid(5);
            } else {
                const existing = await urls.findOne({ slug });
                if (existing) {
                    throw new Error('Slug in use')
                }
            }
            slug = slug.toLowerCase();
            const newUrl = {
                url, slug
            }
            const created = await urls.insert(newUrl)
            created.slug = `${process.env.WEBSITE}:${process.env.PORT}/${slug}`
            res.json(created)
        } catch (error) {
            next(error)
        }
    })

app.use((error, req, res, next) => {
    if (error.status) {
        res.status(error.status);
    } else {
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? ':/' : error.stack,
    });
});



if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    console.log('production');
    app.use(express.static(path.join(__dirname, 'client/build')));

    // Handle React routing, return all requests to React app
    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

const port = process.env.PORT || 1337;
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
})

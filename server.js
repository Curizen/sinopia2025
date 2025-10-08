const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const i18n = require('i18n');
const setLanguage = require('./middleware/setLanguage');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const crypto = require('crypto'); 

const app = express();
const PORT = 3000;

app.use(session({
  secret: 'h97ugh4ugiuengu9ejg3o4gjipgejndbihyfuge674htfixj3ciptvj480tj',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  if (!req.cookies.curizen_client_id) {
    const clientId = crypto.randomUUID(); 
    res.cookie('curizen_client_id', clientId, {
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000, 
      httpOnly: false, 
      sameSite: 'Lax',
    });
    req.client_id = clientId;
  } else {
    req.client_id = req.cookies.curizen_client_id;
  }
  next();
});

app.use((req, res, next) => {
  res.locals.authorized = req.session?.authorized || false;
  res.locals.userId = req.session?.userId || null;
  res.locals.role = req.session?.role || null;
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  etag: true,
  lastModified: true
}));

i18n.configure({
  locales: ['en', 'de'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  cookie: 'locale',
  autoReload: true,
  objectNotation: true
});
app.use(i18n.init);
app.use(setLanguage);
app.use((req, res, next) => {
  res.locals.currentLang = req.getLocale ? req.getLocale() : 'en';
  next();
});

const indexRoutes = require('./routes/index.route');
const accountRoutes = require('./routes/account.route');
const clientRoutes = require('./routes/client.route');
const languageRoutes = require('./routes/language.route');
const authRoute = require('./routes/auth.route');
const projectRoutes = require('./routes/project.route');
const chatRoutes = require('./routes/chat.route');
const cvRoutes = require('./routes/cv.route');

app.use((req, res, next) => {
  res.locals.client_id = req.client_id;
  next();
});

app.use('/chat', chatRoutes);
app.use('/project', projectRoutes);
app.use('/language', languageRoutes);
app.use('/', indexRoutes);
app.use('/account', accountRoutes);
app.use('/client', clientRoutes);
app.use('/auth', authRoute);
app.use('/cv', cvRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

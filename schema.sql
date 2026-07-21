CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'root',
    appName TEXT NOT NULL DEFAULT 'VelvetSnap',
    appTagline TEXT NOT NULL DEFAULT 'AI-Powered Photobooth Experience',
    heroSubtitle TEXT NOT NULL DEFAULT 'Pilih frame, foto, edit, dan dapatkan hasil cetakan berkualitas tinggi dalam hitungan menit',
    logo TEXT NOT NULL DEFAULT '',
    cardSmallHtml TEXT NOT NULL DEFAULT '',
    cardPromoHtml TEXT NOT NULL DEFAULT '',
    slideshowImages TEXT NOT NULL DEFAULT '["https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80","https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80","https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80","https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&q=80"]',
    header TEXT NOT NULL DEFAULT '{"location":"Jakarta","navItems":"[{\"label\":\"Instagram\",\"url\":\"https://instagram.com\"},{\"label\":\"WhatsApp\",\"url\":\"https://wa.me/628123456789\"},{\"label\":\"Templates\",\"url\":\"/templates\"},{\"label\":\"Studio\",\"url\":\"/strips-studio\"}]"}',
    footer TEXT NOT NULL DEFAULT '{"text":"VelvetSnap Photobooth Platform"}',
    system TEXT NOT NULL DEFAULT '{"primaryColor":"#262626","accentColor":"#C5D89D","showPreloader":true,"showStrips":true,"slideshowInterval":3000,"sessionTimer":600}',
    uiTheme TEXT NOT NULL DEFAULT 'v1',
    password TEXT NOT NULL DEFAULT '',
    passwordSalt TEXT NOT NULL DEFAULT '',
    session TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL DEFAULT '',
    passwordSalt TEXT NOT NULL DEFAULT '',
    session TEXT NOT NULL DEFAULT '',
    settings TEXT NOT NULL DEFAULT '{}',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_accounts_session ON accounts(session);

CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    templateId TEXT NOT NULL UNIQUE,
    templateName TEXT NOT NULL DEFAULT '',
    templateDesc TEXT NOT NULL DEFAULT '',
    templatePrice REAL NOT NULL DEFAULT 35000,
    templateFull TEXT NOT NULL DEFAULT '',
    templateThumb TEXT NOT NULL DEFAULT '',
    templateData TEXT NOT NULL DEFAULT '{}',
    isActive INTEGER NOT NULL DEFAULT 1,
    accountId TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_templates_accountId ON templates(accountId);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    sessionId TEXT NOT NULL,
    templateId TEXT NOT NULL DEFAULT 't1',
    price REAL NOT NULL DEFAULT 35000,
    status TEXT NOT NULL DEFAULT 'PENDING',
    captures TEXT NOT NULL DEFAULT '[]',
    finalImage TEXT NOT NULL DEFAULT '',
    showInCarousel INTEGER NOT NULL DEFAULT 0,
    accountId TEXT,
    orderId TEXT,
    midtransTransactionId TEXT,
    midtransStatus TEXT,
    paymentMethod TEXT,
    qrCodeUrl TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_transactions_sessionId ON transactions(sessionId);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_accountId ON transactions(accountId);
CREATE INDEX IF NOT EXISTS idx_transactions_showInCarousel ON transactions(showInCarousel);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_orderId ON transactions(orderId);

CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    deviceId TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OFFLINE',
    lastPing TEXT NOT NULL DEFAULT (datetime('now')),
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (id) VALUES ('root');

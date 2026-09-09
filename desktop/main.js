// AXIA Desktop - app Electron real que embrulha o dashboard web do AXIA
// (backend Express rodando em http://localhost:8080, via `./start.sh` ou
// `docker compose up`). Não reimplementa nenhuma lógica: é só uma janela
// nativa com menu, que aponta pra mesma UI web.
'use strict';

const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('node:path');

const AXIA_URL = process.env.AXIA_URL || 'http://localhost:8080';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'AXIA',
    backgroundColor: '#0b1020',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const menu = Menu.buildFromTemplate([
    {
      label: 'AXIA',
      submenu: [
        { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', click: () => win.reload() },
        { label: 'Abrir no navegador', click: () => shell.openExternal(win.webContents.getURL()) },
        { type: 'separator' },
        { role: 'quit', label: 'Sair' },
      ],
    },
    {
      label: 'Visualizar',
      submenu: [{ role: 'toggleDevTools', label: 'Ferramentas do desenvolvedor' }],
    },
  ]);
  Menu.setApplicationMenu(menu);

  win.loadURL(AXIA_URL).catch((err) => {
    console.error('[axia-desktop] falha ao carregar', AXIA_URL, err.message);
    win.loadURL(
      'data:text/html,' +
        encodeURIComponent(
          `<body style="background:#0b1020;color:#e8ecfb;font-family:sans-serif;padding:40px">
             <h1>AXIA Desktop</h1>
             <p>Não foi possível conectar em <b>${AXIA_URL}</b>.</p>
             <p>Rode <code>./start.sh</code> ou <code>docker compose up</code> primeiro, depois abra este app de novo.</p>
           </body>`
        )
    );
  });

  // Modo de diagnóstico: tira um screenshot da janela e sai. Útil para
  // verificar visualmente que o app carregou de verdade em ambientes sem
  // display (CI, containers) via `xvfb-run`.
  const screenshotPath = process.env.AXIA_SCREENSHOT_AND_QUIT;
  if (screenshotPath) {
    win.webContents.once('did-finish-load', async () => {
      await new Promise((r) => setTimeout(r, 1000)); // dá tempo do JS da página rodar
      const image = await win.webContents.capturePage();
      require('node:fs').writeFileSync(screenshotPath, image.toPNG());
      console.log(`[axia-desktop] screenshot salvo em ${screenshotPath}`);
      app.quit();
    });
  }

  return win;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

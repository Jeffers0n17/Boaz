// Preload script do AXIA Desktop. Roda com acesso ao Node antes da página
// carregar, mas expõe só o necessário pro contexto da página (contextIsolation).
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('axiaDesktop', {
  isElectron: true,
  platform: process.platform,
});

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  
  const page = await browser.newPage();
  console.log('Navegando para Dotabuff...');
  
  // Abrir a página inicial do Dotabuff primeiro
  await page.goto('https://www.dotabuff.com', { waitUntil: 'domcontentloaded' });
  console.log('Página inicial carregada!');
  
  // Aguardar 5 segundos
  await page.waitForTimeout(5000);
  
  // Depois navegar para o perfil
  console.log('Navegando para o perfil...');
  await page.goto('https://www.dotabuff.com/players/97758803/matches?enhance=overview&page=1', { 
    waitUntil: 'domcontentloaded' 
  });
  
  console.log('URL atual:', page.url());
  console.log('Aguardando interação manual...');
  
  // Manter aberto para debug
  await new Promise(() => {});
})();
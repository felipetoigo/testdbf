import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('🚀 Iniciando Playwright...');
  
  // Criar um diretório temporário para o perfil
  const tempProfileDir = path.join(__dirname, 'temp_profile');
  if (fs.existsSync(tempProfileDir)) {
    fs.rmSync(tempProfileDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempProfileDir, { recursive: true });
  
  console.log('📱 Criando perfil temporário em:', tempProfileDir);
  
  let context;
  let page;
  
  try {
    // Usar launchPersistentContext com o diretório temporário
    context = await chromium.launchPersistentContext(tempProfileDir, {
      executablePath: CHROME_PATH,
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-plugins',
        '--start-maximized'
      ],
      timeout: 60000
    });
    
    console.log('✅ Chrome iniciado!');
    
    // Pegar página existente ou criar nova
    const pages = context.pages();
    if (pages.length > 0) {
      page = pages[0];
      console.log('📄 Usando página existente');
    } else {
      page = await context.newPage();
      console.log('📄 Criando nova página');
    }
    
    console.log('\n🔐 O navegador será aberto. Faça login no Dotabuff manualmente.');
    console.log('⏳ Aguardando 10 segundos para você começar...');
    await page.waitForTimeout(10000);
    
    // Array para armazenar os dados
    const allHeroData: Array<[string, string, string]> = [];
    const heroCounts: Record<string, { won: number, lost: number, total: number }> = {};
    
    // Definir quantas páginas processar (você pode aumentar este número)
    const TOTAL_PAGES = 3; // Mude para quantas páginas quiser processar
    
    // Processar páginas
    for (let pageNumber = 1; pageNumber <= TOTAL_PAGES; pageNumber++) {
      const targetUrl = `https://www.dotabuff.com/players/97758803/matches?enhance=overview&page=${pageNumber}`;
      console.log(`\n🌐 Acessando página ${pageNumber} de ${TOTAL_PAGES}...`);
      
      try {
        // Navegar para a URL
        console.log(`📍 Navegando para: ${targetUrl}`);
        await page.goto(targetUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 45000 
        });
        
        console.log(`✅ Página carregada!`);
        console.log(`📍 URL atual: ${page.url()}`);
        
        // Aguardar um pouco
        await page.waitForTimeout(3000);
        
        // Verificar se é página de segurança ou login
        const pageText = await page.evaluate(() => document.body.innerText);
        
        if (pageText.includes('Verificação de segurança') || 
            pageText.includes('security check') || 
            pageText.includes('Cloudflare') ||
            pageText.includes('Please wait')) {
          console.log('⚠️ Página de verificação de segurança detectada!');
          console.log('📸 Salvando screenshot...');
          await page.screenshot({ path: `security_${pageNumber}.png` });
          
          console.log('\n🔐 Complete a verificação manualmente no navegador.');
          console.log('⏳ Aguardando 30 segundos...');
          await page.waitForTimeout(30000);
          
          // Recarregar
          console.log('🔄 Recarregando...');
          await page.reload({ waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(3000);
        }
        
        if (pageText.includes('Sign In') || pageText.includes('Login') || pageText.includes('Entrar')) {
          console.log('🔐 Página de login detectada!');
          console.log('Por favor, faça login manualmente no navegador.');
          console.log('⏳ Aguardando 30 segundos...');
          await page.waitForTimeout(30000);
          
          // Tentar novamente
          await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(3000);
        }
        
        // Verificar se encontrou a tabela
        const tableExists = await page.evaluate(() => {
          const rows = document.querySelectorAll('tbody tr');
          return rows.length > 0;
        });
        
        if (!tableExists) {
          console.log(`❌ Tabela não encontrada na página ${pageNumber}!`);
          console.log('📄 Conteúdo da página (primeiros 500 caracteres):');
          const content = await page.evaluate(() => document.body.innerText.substring(0, 500));
          console.log(content);
          
          // Salvar screenshot para debug
          await page.screenshot({ path: `no_table_${pageNumber}.png` });
          
          // Se não encontrou tabela e não é a primeira página, pode ser que não haja mais partidas
          if (pageNumber > 1) {
            console.log('📊 Possivelmente não há mais partidas para carregar.');
            break; // Sai do loop se não encontrar mais partidas
          }
          continue;
        }
        
        // Extrair dados
        const rows = await page.$$('tbody > tr:not(:first-child)');
        console.log(`✅ Encontradas ${rows.length} partidas na página ${pageNumber}`);
        
        if (rows.length === 0) {
          console.log(`📊 Nenhuma partida encontrada na página ${pageNumber}. Finalizando...`);
          break;
        }
        
        for (const row of rows) {
          try {
            const [heroName, result, skillBase] = await row.evaluate(row => {
              const heroName = row.querySelector('.cell-large a')?.textContent?.trim();
              const result = row.querySelector('.cell-large div.subtext')?.textContent?.trim();
              
              const winElement = row.querySelector('.won');
              const loseElement = row.querySelector('.lost');
              
              let skillBase: string;
              if (winElement) skillBase = 'won';
              else if (loseElement) skillBase = 'lost';
              else skillBase = 'unknown';
              
              return [heroName || '', result || '', skillBase];
            });
            
            if (heroName) {
              allHeroData.push([heroName, result, skillBase]);
              
              if (!heroCounts[heroName]) {
                heroCounts[heroName] = { won: 0, lost: 0, total: 0 };
              }
              
              heroCounts[heroName].total++;
              if (result === 'Won Match' || skillBase === 'won') {
                heroCounts[heroName].won++;
              } else if (result === 'Lost Match' || skillBase === 'lost') {
                heroCounts[heroName].lost++;
              }
            }
          } catch (rowError) {
            console.error('Erro ao processar linha:', rowError);
          }
        }
        
        // Salvar progresso parcial
        console.log(`📊 Progresso: ${allHeroData.length} partidas coletadas até agora`);
        
      } catch (error) {
        console.error(`❌ Erro na página ${pageNumber}:`, error.message);
        console.log('📸 Salvando screenshot de erro...');
        await page.screenshot({ path: `error_${pageNumber}.png` });
        
        // Se erro na página 2+, pode ser que não haja mais páginas
        if (pageNumber > 1) {
          console.log('📊 Possivelmente não há mais páginas para carregar.');
          break;
        }
      }
    }
    
    // Exibir resultados
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADOS FINAIS');
    console.log('='.repeat(60));
    
    if (allHeroData.length === 0) {
      console.log('❌ Nenhuma partida foi processada!');
      console.log('\n🔍 Diagnóstico:');
      console.log('1. Verifique se você fez login manualmente');
      console.log('2. Verifique se completou a verificação de segurança');
      console.log('3. Verifique os screenshots salvos');
      console.log('4. Verifique se o ID do jogador está correto: 97758803');
    } else {
      console.log(`✅ Total de partidas processadas: ${allHeroData.length}`);
      
      const sortedHeroCounts = Object.entries(heroCounts)
        .sort(([, a], [, b]) => b.total - a.total);
      
      console.log('\n🏆 TOP 10 HEROIS MAIS JOGADOS:');
      console.log('-'.repeat(50));
      for (const [heroName, counts] of sortedHeroCounts.slice(0, 10)) {
        const winRate = counts.total > 0 ? Math.round((counts.won / counts.total) * 100) : 0;
        console.log(`${heroName.padEnd(20)} ${counts.total.toString().padStart(3)} jogos (${counts.won}V/${counts.lost}D - ${winRate}%)`);
      }
      
      // Estatísticas gerais
      let wonCount = 0, lostCount = 0, unknownCount = 0;
      for (const [, , skillBase] of allHeroData) {
        if (skillBase === 'won') wonCount++;
        else if (skillBase === 'lost') lostCount++;
        else unknownCount++;
      }
      
      console.log('\n📈 ESTATÍSTICAS GERAIS:');
      console.log('-'.repeat(30));
      console.log(`✅ Vitórias:  ${wonCount}`);
      console.log(`❌ Derrotas:  ${lostCount}`);
      console.log(`❓ Desconhecidos: ${unknownCount}`);
      console.log(`📊 Taxa de vitória: ${allHeroData.length > 0 ? Math.round((wonCount / allHeroData.length) * 100) : 0}%`);
      
      // Mostrar heróis com maior taxa de vitória (mínimo 5 jogos)
      console.log('\n🏅 MELHORES TAXAS DE VITÓRIA (mín. 5 jogos):');
      console.log('-'.repeat(50));
      const topWinRate = sortedHeroCounts
        .filter(([, counts]) => counts.total >= 5)
        .sort(([, a], [, b]) => (b.won / b.total) - (a.won / a.total))
        .slice(0, 5);
      
      for (const [heroName, counts] of topWinRate) {
        const winRate = Math.round((counts.won / counts.total) * 100);
        console.log(`${heroName.padEnd(20)} ${winRate}% (${counts.won}V/${counts.lost}D)`);
      }
    }
    
    console.log('\n💡 Pressione Ctrl+C para fechar o navegador.');
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
  } finally {
    // Limpar perfil temporário ao fechar
    try {
      if (context) {
        await context.close();
      }
      if (fs.existsSync(tempProfileDir)) {
        fs.rmSync(tempProfileDir, { recursive: true, force: true });
        console.log('🧹 Perfil temporário removido');
      }
    } catch (e) {
      // Ignorar erro ao limpar
    }
  }
})();
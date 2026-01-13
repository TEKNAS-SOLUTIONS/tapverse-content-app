import puppeteer from 'puppeteer';

const DIR = '/root/test-screenshots';

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const pages = [
    ['03-projects-list', 'http://localhost:3000/projects'],
    ['04-admin-setup', 'http://localhost:3000/admin'],
  ];

  for (const [name, url] of pages) {
    console.log('Capturing:', name);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: DIR + '/' + name + '.png', fullPage: true });
  }

  // Capture client form with tabs
  console.log('Capturing: client form tabs');
  await page.goto('http://localhost:3000/clients', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  
  // Click first button (Create Client)
  const buttons = await page.$$('button');
  if (buttons.length > 0) {
    await buttons[0].click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: DIR + '/05-client-form-basic.png', fullPage: true });
    
    // Click Services tab
    const allBtns = await page.$$('button');
    for (const btn of allBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Services')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({ path: DIR + '/06-client-form-services.png', fullPage: true });
        break;
      }
    }
    
    // Click Brand tab
    const brandBtns = await page.$$('button');
    for (const btn of brandBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Brand')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({ path: DIR + '/07-client-form-brand.png', fullPage: true });
        break;
      }
    }
    
    // Click Platform tab
    const platBtns = await page.$$('button');
    for (const btn of platBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Platform')) {
        await btn.click();
        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({ path: DIR + '/08-client-form-platforms.png', fullPage: true });
        break;
      }
    }
  }

  // Capture project form
  console.log('Capturing: project form');
  await page.goto('http://localhost:3000/projects', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  const projBtns = await page.$$('button');
  if (projBtns.length > 0) {
    await projBtns[0].click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: DIR + '/09-project-form.png', fullPage: true });
  }

  // Try project detail page
  console.log('Capturing: project detail');
  await page.goto('http://localhost:3000/projects', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 500));
  const links = await page.$$('a');
  for (const link of links) {
    const href = await page.evaluate(el => el.href, link);
    if (href && href.includes('/projects/') && !href.endsWith('/projects/')) {
      await link.click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: DIR + '/10-project-detail.png', fullPage: true });
      break;
    }
  }

  await browser.close();
  console.log('All screenshots captured!');
}

run().catch(e => { console.error(e); process.exit(1); });


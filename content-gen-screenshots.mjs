import puppeteer from 'puppeteer';

const DIR = '/root/test-screenshots';

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });

  // Go to project detail page
  console.log('Going to project detail page...');
  await page.goto('http://localhost:3000/projects/cf4900a7-3cd4-4906-b771-b808739e7085', { 
    waitUntil: 'networkidle2', 
    timeout: 30000 
  });
  await new Promise(r => setTimeout(r, 2000));
  
  // Screenshot before generation
  console.log('Screenshot: Before generation');
  await page.screenshot({ path: DIR + '/11-content-gen-before.png', fullPage: true });

  // Click Generate All button
  console.log('Clicking Generate All...');
  const genBtn = await page.$('button');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Generate All')) {
      await btn.click();
      console.log('Clicked Generate button');
      break;
    }
  }

  // Wait for generation (this might take 30-60 seconds)
  console.log('Waiting for content generation...');
  await new Promise(r => setTimeout(r, 45000));
  
  // Screenshot after generation
  console.log('Screenshot: After generation');
  await page.screenshot({ path: DIR + '/12-content-gen-after.png', fullPage: true });

  // Click through tabs to capture each content type
  const tabs = ['Blog', 'Google', 'Social'];
  for (const tabName of tabs) {
    const allBtns = await page.$$('button');
    for (const btn of allBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes(tabName)) {
        await btn.click();
        await new Promise(r => setTimeout(r, 1000));
        const filename = tabName.toLowerCase().replace(' ', '-');
        console.log('Screenshot:', tabName);
        await page.screenshot({ path: DIR + '/13-content-' + filename + '.png', fullPage: true });
        break;
      }
    }
  }

  await browser.close();
  console.log('Done!');
}

run().catch(e => { console.error(e); process.exit(1); });


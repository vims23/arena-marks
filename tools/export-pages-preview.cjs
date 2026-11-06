const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.ARENA_PLAYWRIGHT || 'playwright');

async function main() {
  const target = path.resolve(process.argv[2]);
  const base = process.env.ARENA_PREVIEW_ORIGIN || 'http://127.0.0.1:3101';
  const browser = await chromium.launch({ executablePath: process.env.ARENA_CHROME });
  try {
    const page = await browser.newPage();
    await fs.mkdir(target, { recursive: true });
    const routes = [['/', 'index.html', '.marks-hero h1'],
      ['/inscricao', 'inscricao.html', '.reference-form-grid'],
      ['/campeonato', 'campeonato.html', '.marks-about h1'],
      ['/regulamento', 'regulamento.html', '.marks-rules h1'],
      ['/seja-um-patrocinador', 'seja-um-patrocinador.html', '.marks-sponsor-page h1']];
    for (const [route, file, selector] of routes) {
      await page.goto(base + route);
      await page.locator(selector).waitFor();
      const styles = await page.locator('link[rel=stylesheet]').evaluateAll(links => links.map(link => link.getAttribute('href')));
      const css = await Promise.all(styles.map(async url => {
        const response = await fetch(base + url);
        if (!response.ok) throw Error('CSS: ' + response.status);
        return (await response.text()).replace(/url\((["']?)\/(?!\/)/g, 'url($1./');
      }));
      await fs.writeFile(path.join(target, 'arena.css'), css.join('\n'));
      const html = await page.evaluate(() => {
        const copy = document.documentElement.cloneNode(true);
        copy.querySelectorAll('script,style,link,iframe').forEach(node => node.remove());
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = './arena.css';
        copy.querySelector('head').append(cssLink);
        for (const node of copy.querySelectorAll('img[src]')) {
          const src = node.getAttribute('src');
          if (src.startsWith('/') && !src.startsWith('//')) node.setAttribute('src', '.' + src);
        }
        for (const link of copy.querySelectorAll('a[href]')) {
          const href = link.getAttribute('href');
          if (href === '/') link.setAttribute('href', './index.html');
          else if (href.startsWith('/#')) link.setAttribute('href', './index.html' + href.slice(1));
          else if (['/inscricao', '/inscrever'].includes(href)) link.setAttribute('href', './inscricao.html');
          else if (['/campeonato', '/regulamento', '/seja-um-patrocinador'].includes(href)) link.setAttribute('href', '.' + href + '.html');
          else if (href === '/regulamento-champions-marks-league.pdf') link.setAttribute('href', '.' + href);
          else if (href.startsWith('/')) link.remove();
        }
        const form = copy.querySelector('.registration-panel form');
        if (form) {
          const notice = document.createElement('p');
          notice.textContent = 'Prévia visual. O envio de inscrições está desativado.';
          notice.className = 'form-error';
          form.before(notice);
          form.querySelectorAll('input,select,button').forEach(control => control.disabled = true);
          const container = document.createElement('div');
          container.append(...form.childNodes);
          form.replaceWith(container);
        }
        return '<!doctype html>\n' + copy.outerHTML;
      });
      await fs.writeFile(path.join(target, file), html);
    }
    for (const asset of ['arena-event.jpg', 'arena-marks-symbol.png', 'arena-marks-white.png', 'arena-marks.png', 'regulamento-champions-marks-league.pdf']) {
      await fs.copyFile(path.join(__dirname, '..', 'public', asset), path.join(target, asset));
    }
    await fs.writeFile(path.join(target, '.nojekyll'), '');
    await fs.cp(path.join(__dirname, '..', 'public', 'clubs'), path.join(target, 'clubs'), { recursive: true });
    await fs.cp(path.join(__dirname, '..', 'public', 'sponsors'), path.join(target, 'sponsors'), { recursive: true });
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });

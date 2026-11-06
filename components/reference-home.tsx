import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CalendarDays, Clock3, Gamepad2, Instagram, MapPin, Trophy, Youtube } from 'lucide-react';
import type { PageContext } from './reference-pages';

export function MarksHeader({ registration = false }: { registration?: boolean }) {
  return (
      <header className="marks-header">
        <div className="marks-wrap marks-header-inner">
          <Link href="/" className="marks-brand">
            <img src="/arena-marks-symbol.png" alt="" width="60" height="60" />
            <span>Arena Marks</span>
          </Link>
          <nav aria-label="Menu principal">
            <Link href="/" aria-current={registration ? undefined : 'page'}>Início</Link>
            <a href={registration ? '/#campeonato' : '#campeonato'}>Campeonato</a>
            <a href={registration ? '/#formato' : '#formato'}>Formato</a>
            <a href={registration ? '/#regulamento' : '#regulamento'}>Regulamento</a>
          </nav>
          {registration ? <span className="marks-header-current" aria-current="page">Inscrição</span> : <Link className="marks-gold" href="/inscricao">Inscreva-se</Link>}
        </div>
      </header>
  );
}

export function MarksFooter() {
  const socials = [
    { label: 'Instagram', icon: Instagram, href: process.env.NEXT_PUBLIC_ARENA_INSTAGRAM_URL },
    { label: 'YouTube', icon: Youtube, href: process.env.NEXT_PUBLIC_ARENA_YOUTUBE_URL },
  ].filter(({ href }) => href?.startsWith('https://'));

  return (
    <footer className="marks-site-footer">
      <div className="marks-wrap marks-footer-main">
        <div>
          <Link href="/" className="marks-brand">
            <img src="/arena-marks-symbol.png" alt="" width="44" height="44" />
            <span>Arena Marks</span>
          </Link>
          <p>Champions Marks League</p>
        </div>
        <nav aria-label="Links do rodapé">
          <h2>Campeonato</h2>
          <Link href="/#campeonato">Sobre o campeonato</Link>
          <Link href="/#regulamento">Regulamento</Link>
          <Link href="/inscricao">Inscrição</Link>
        </nav>
        <div className="marks-footer-social">
          <h2>Redes sociais</h2>
          {socials.length ? socials.map(({ label, icon: Icon, href }) => (
            <a key={label} href={href}><Icon size={18} />{label}<ArrowUpRight size={14} /></a>
          )) : <p>Perfis oficiais a divulgar.</p>}
        </div>
      </div>
      <div className="marks-wrap marks-footer-bottom">
        <small>© {new Date().getFullYear()} Arena Marks. Todos os direitos reservados.</small>
        <Link href="/admin">Acesso da organização <ArrowUpRight size={15} /></Link>
      </div>
    </footer>
  );
}

export function ReferenceHome({ state }: PageContext) {
  const { title, capacity, groupCount, stationCount, date, time, venue, rules, game } = state.settings;
  const titleMatch = title.match(/^(Champions)\s+(.+)$/i);
  const eventDate = date
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'))
    : 'A definir';
  return (
    <div className="marks-home">
      <MarksHeader />
      <main>
        <section className="marks-hero" aria-labelledby="marks-title">
          <img className="marks-hero-photo" src="/arena-event.jpg" alt="" fetchPriority="high" />
          <div className="marks-wrap marks-hero-content">
            <h1 id="marks-title">{titleMatch ? <>{titleMatch[1]}<span>{titleMatch[2]}</span></> : title}</h1>
            <p>Um campeonato de futebol no videogame para reunir amigos, disputar cada lance e celebrar a resenha.</p>
            <div className="marks-actions">
              <Link href="/inscricao" className="marks-gold">Fazer inscrição <ArrowRight size={18} /></Link>
              <a href="#campeonato" className="marks-text-link">Conhecer o campeonato</a>
            </div>
          </div>
        </section>
        <div className="marks-facts">
          <div className="marks-wrap marks-facts-inner">
            <div><strong>{capacity}</strong><span>Vagas</span></div>
            <div><strong>{groupCount}</strong><span>Grupos</span></div>
            <div><strong>{stationCount}</strong><span>Estações de jogo</span></div>
          </div>
        </div>
        <section id="campeonato" className="marks-section">
          <div className="marks-wrap marks-about">
            <div>
              <h2>Sobre o campeonato</h2>
              <p>A disputa é individual, da fase de grupos à final. Confira os dados da edição antes de se inscrever.</p>
              <p className="marks-game"><Gamepad2 size={19} /> {game}</p>
            </div>
            <dl className="marks-details">
              <div><CalendarDays size={20} /><dt>Data</dt><dd>{eventDate}</dd></div>
              <div><Clock3 size={20} /><dt>Horário</dt><dd>{time || 'A definir'}</dd></div>
              <div><MapPin size={20} /><dt>Local</dt><dd>{venue?.trim() || 'A definir'}</dd></div>
            </dl>
          </div>
        </section>
        <section id="formato" className="marks-section marks-format">
          <div className="marks-wrap">
            <h2>Da inscrição à final</h2>
            <ol>
              <li><span>01</span><h3>Inscrição</h3><p>Envie seus dados para análise da organização.</p><Link href="/inscricao">Ir para inscrição <ArrowRight size={15} /></Link></li>
              <li><span>02</span><h3>Fase de grupos</h3><p>O sorteio presencial define a distribuição dos jogadores.</p></li>
              <li><span>03</span><h3>Eliminatórias</h3><p>Os classificados disputam a chave até a decisão do título.</p></li>
            </ol>
          </div>
        </section>
        <section id="regulamento" className="marks-section marks-rules">
          <div className="marks-wrap">
            <h2><Trophy size={23} /> Regulamento</h2>
            <p>{rules?.trim() || 'O regulamento oficial será divulgado pela organização.'}</p>
          </div>
        </section>
      </main>
      <MarksFooter />
    </div>
  );
}

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, CalendarDays, ClipboardList, Clock3, Gamepad2, Instagram, MapPin, Trophy, Users, Youtube } from 'lucide-react';
import type { PageContext } from './reference-pages';

export const RULES_PDF = '/regulamento-champions-marks-league.pdf';

const clubs = [
  ['Real Madrid', 'real-madrid'],
  ['Barcelona', 'barcelona'],
  ['Manchester City', 'manchester-city'],
  ['Bayern de Munique', 'bayern'],
  ['Manchester United', 'manchester-united'],
  ['Atlético de Madrid', 'atletico'],
  ['Arsenal', 'arsenal'],
  ['Chelsea', 'chelsea'],
  ['Milan', 'milan'],
  ['Inter de Milão', 'inter'],
  ['Liverpool', 'liverpool'],
  ['Juventus', 'juventus'],
  ['Roma', 'roma'],
  ['Paris Saint-Germain (PSG)', 'psg'],
  ['Borussia Dortmund', 'dortmund'],
  ['Tottenham', 'tottenham'],
];

const rulesHighlights = [
  ['Inscrição e vaga', 'O cadastro exige foto. A vaga só é confirmada depois da conferência do pagamento via PIX e da aprovação manual pela organização.'],
  ['Sorteio e grupos', 'O sorteio de jogadores e clubes é físico e presencial. São 32 jogadores em quatro grupos de oito. Cada jogador disputa sete partidas, e os quatro melhores de cada grupo avançam.'],
  ['Pontuação e desempate', 'Vitória vale 3 pontos, empate vale 1 e derrota vale 0. Em caso de empate na classificação, valem, em ordem: saldo de gols, gols marcados, confronto direto, menor pontuação disciplinar e sorteio público.'],
  ['Eliminatórias', 'Os confrontos são em jogo único, com dois tempos de quatro minutos. Se houver empate, a decisão vai direto aos pênaltis. Há disputa de terceiro lugar antes da final.'],
];

const rulesFaq = [
  ['Já há data, endereço e valor de inscrição?', 'Ainda não. A data, o endereço, o valor e o prazo geral de pagamento estão pendentes na minuta. A política de reembolso também não foi definida.'],
  ['Como funciona a lista de espera?', 'Com as 32 vagas confirmadas, a lista recebe novos interessados sem pagamento antecipado. A convocação segue a ordem de inscrição, e a pessoa chamada tem 24 horas para aceitar.'],
  ['Posso levar meu próprio controle?', 'Sim, se for compatível e não tiver modificações que deem vantagem competitiva. Você pode testá-lo antes da primeira partida, sem atrasar o cronograma.'],
  ['O que acontece se eu perder a chamada?', 'Você tem três minutos após a convocação oficial. Depois desse prazo, perde a partida por WO de 3 a 0 se o adversário estiver presente. Isso não elimina automaticamente você dos jogos seguintes.'],
  ['Como contesto um resultado?', 'Procure a coordenação em até cinco minutos após o fim da partida. O placar fica em análise e não define classificações ou confrontos que dependam dele até a decisão.'],
  ['Há prêmios individuais?', 'Sim. Além dos prêmios do pódio, estão previstos troféus para Melhor Ataque, Melhor Defesa e Destaque do Torneio, sem valor adicional em dinheiro.'],
];

export function MarksHeader({ registration = false, active = '/' }: { registration?: boolean; active?: string }) {
  return (
      <header className="marks-header">
        <div className="marks-wrap marks-header-inner">
          <Link href="/" className="marks-brand">
            <img src="/arena-marks-symbol.png" alt="" width="60" height="60" />
            <span>Arena Marks</span>
          </Link>
          <nav aria-label="Menu principal">
            <Link href="/" aria-current={!registration && active === '/' ? 'page' : undefined}>Início</Link>
            <Link href="/campeonato" aria-current={active === '/campeonato' ? 'page' : undefined}>Campeonato</Link>
            <Link href="/regulamento" aria-current={active === '/regulamento' ? 'page' : undefined}>Regulamento</Link>
          </nav>
          {registration ? <span className="marks-header-current" aria-current="page">Inscrição</span> : <Link className="marks-gold" href="/inscricao">Inscreva-se</Link>}
        </div>
      </header>
  );
}

export function MarksFooter() {
  const socials = [
    { label: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/arena_marks?igsh=MWE3cXY4NXV5NmQ2aw%3D%3D' },
    { label: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@ARENAMARKS' },
  ];

  return (
    <footer className="marks-site-footer">
      <div className="marks-wrap marks-footer-main">
        <div>
          <Link href="/" className="marks-brand">
            <img src="/arena-marks-white.png" alt="" width="56" height="56" />
            <span>Arena Marks</span>
          </Link>
          <p>Champions Marks League</p>
        </div>
        <nav aria-label="Links do rodapé">
          <h2>Campeonato</h2>
          <Link href="/campeonato">Sobre o campeonato</Link>
          <Link href="/regulamento">Regulamento</Link>
          <Link href="/inscricao">Inscrição</Link>
        </nav>
        <div className="marks-footer-social">
          <h2>Redes sociais</h2>
          {socials.map(({ label, icon: Icon, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener"><Icon size={18} />{label}<ArrowUpRight size={14} /></a>
          ))}
        </div>
      </div>
      <div className="marks-wrap marks-footer-bottom">
        <small>© {new Date().getFullYear()} Arena Marks. Todos os direitos reservados.</small>
        <Link href="/admin">Acesso da organização <ArrowUpRight size={15} /></Link>
      </div>
    </footer>
  );
}

export function ReferenceHome({ state, view = 'home' }: PageContext & { view?: 'home' | 'competition' | 'rules' }) {
  const { title, date, time, venue, game } = state.settings;
  const titleMatch = title.match(/^(Champions)\s+(.+)$/i);
  const eventDate = date
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'))
    : 'A definir';
  return (
    <div className="marks-home">
      <MarksHeader active={view === 'competition' ? '/campeonato' : view === 'rules' ? '/regulamento' : '/'} />
      <main>
        {view === 'home' && <>
        <section className="marks-hero" aria-labelledby="marks-title">
          <img className="marks-hero-photo" src="/arena-event.jpg" alt="" fetchPriority="high" />
          <div className="marks-wrap marks-hero-content">
            <h1 id="marks-title">{titleMatch ? <>{titleMatch[1]}<span>{titleMatch[2]}</span></> : title}</h1>
            <p>Um campeonato de futebol no videogame para reunir amigos, disputar cada lance e celebrar a resenha.</p>
            <div className="marks-actions">
              <Link href="/inscricao" className="marks-gold">Fazer inscrição <ArrowRight size={18} /></Link>
              <Link href="/campeonato" className="marks-text-link">Conhecer o campeonato</Link>
            </div>
          </div>
        </section>
        <div className="marks-facts marks-reveal">
          <div className="marks-wrap marks-facts-inner">
            <div><Users size={19} aria-hidden="true" /><span><b>32</b> vagas</span></div>
            <div><Gamepad2 size={19} aria-hidden="true" /><span>{game}</span></div>
            <div><MapPin size={19} aria-hidden="true" /><span>Torneio presencial</span></div>
          </div>
        </div>
        <section className="marks-section marks-prizes">
          <div className="marks-wrap marks-reveal">
            <h2>Premiação</h2>
            <p>Os três primeiros colocados recebem prêmio em dinheiro e troféu.</p>
            <ol>
              {[
                ['Campeão', 'R$ 3.000,00'],
                ['Vice-campeão', 'R$ 1.500,00'],
                ['Terceiro colocado', 'R$ 500,00'],
              ].map(([label, value], index) => (
                <li key={label}>
                  <div className="marks-prize-rank"><Trophy size={20} aria-hidden="true" /><span aria-hidden="true">0{index + 1}</span></div>
                  <h3>{label}</h3><strong>{value}</strong><span>+ Troféu</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
        </>}
        {view === 'competition' && <>
        <section id="campeonato" className="marks-section">
          <div className="marks-wrap marks-about">
            <div>
              <h1>Sobre o campeonato</h1>
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
        </>}
        {view === 'competition' && <section className="marks-section marks-clubs" aria-labelledby="marks-clubs-title">
          <div className="marks-wrap">
            <div className="marks-clubs-heading">
              <div><h2 id="marks-clubs-title">Clubes do campeonato</h2><p>Os escudos do sorteio oficial.</p></div>
              <div className="marks-clubs-count"><strong>{clubs.length}</strong> clubes</div>
            </div>
            <ul className="marks-clubs-grid">
              {clubs.map(([name, crest], index) => (
                <li key={crest}>
                  <span className="marks-club-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <img src={`/clubs/${crest}.png`} width="88" height="88" alt="" loading="lazy" />
                  <strong>{name}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>}
        {view === 'home' && <section id="formato" className="marks-section marks-format">
          <div className="marks-wrap marks-reveal">
            <h2>Da inscrição à final</h2>
            <ol>
              <li><span><ClipboardList size={19} aria-hidden="true" /></span><h3>Inscrição</h3><p>Envie seus dados para análise da organização.</p><Link href="/inscricao">Fazer inscrição <ArrowRight size={15} /></Link></li>
              <li><span><Users size={19} aria-hidden="true" /></span><h3>Fase de grupos</h3><p>O sorteio presencial define a distribuição dos jogadores.</p></li>
              <li><span><Trophy size={19} aria-hidden="true" /></span><h3>Eliminatórias</h3><p>Os classificados disputam a chave até a decisão do título.</p></li>
            </ol>
          </div>
        </section>}
        {view === 'rules' && <section className="marks-section marks-rules">
          <div className="marks-wrap">
            <div className="marks-rules-heading">
              <p>{title}</p>
              <h1>Regulamento</h1>
            </div>
            <div className="marks-rules-body">
              <h2>Principais regras</h2>
              <ol className="marks-rules-highlights">
                {rulesHighlights.map(([heading, copy], index) => (
                  <li key={heading}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <div><h3>{heading}</h3><p>{copy}</p></div>
                  </li>
                ))}
              </ol>
              <a className="marks-text-link marks-rules-full" href={RULES_PDF} target="_blank" rel="noopener">
                Ler o regulamento na íntegra <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <h2>Dúvidas frequentes</h2>
              <div className="marks-faq">
                {rulesFaq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
              </div>
            </div>
          </div>
        </section>}
      </main>
      <MarksFooter />
    </div>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import './reference.css';
import './home.css';
import './registration.css';
export const metadata: Metadata = { title: 'Arena Marks | Champions Marks League', description: 'A nossa resenha. A nossa liga. Gestão da Champions Marks League II.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}

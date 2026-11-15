import type { ImageMetadata } from 'astro';
import meritoros from '../assets/work/meritoros.webp';
import zkzl from '../assets/work/zkzl.webp';
import opti from '../assets/work/opti_group.webp';
import woodbud from '../assets/work/woodbud.webp';
import gorska from '../assets/work/patrycjagorska.pl.webp';
import kierowcy from '../assets/work/szkoleniakierowcy.pl.webp';
import drgil from '../assets/work/drgil-cennik-po.png';

export interface Project {
  name: string;
  trade: string;
  summary: string;
  tags: string[];
  domain: string;
  href: string;
  image: ImageMetadata;
  alt: string;
  /** false = nie pokazuj na stronie głównej */
  home?: boolean;
}

export const projects: Project[] = [
  {
    name: 'Dworzec Autobusowy Poznań',
    trade: 'ZKZL Poznań · transport publiczny',
    summary: 'Strona dworca, która od 2020 roku codziennie obsługuje tysiące pasażerów. Odjazdy sprawdza się w kilka sekund, także na telefonie przy peronie, a całość spełnia standard WCAG 2.1.',
    tags: ['UX', 'WCAG 2.1', 'Mobile first'],
    domain: 'dworzecautobusowy.poznan.pl',
    href: '/case-study-zkzl.html',
    image: zkzl,
    alt: 'Strona główna Dworca Autobusowego Poznań z wyszukiwarką odjazdów',
  },
  {
    name: 'Meritoros',
    trade: 'Księgowość i BPO',
    summary: 'Wielojęzyczna strona z kalkulatorami wyceny i sekcją dla inwestorów. Zespół klienta sam zmienia treści.',
    tags: ['Projekt graficzny', 'Wielojęzyczność', 'Kalkulatory'],
    domain: 'meritoros.pl',
    href: '/case-study-meritoros.html',
    image: meritoros,
    alt: 'Strona główna Meritoros, firmy księgowej i BPO',
  },
  {
    name: 'Opti Group',
    trade: 'Doradztwo finansowe dla MŚP',
    summary: 'Szeroka oferta doradcza ułożona w czytelną stronę, która buduje zaufanie od pierwszego ekranu.',
    tags: ['Projekt graficzny', 'Struktura oferty'],
    domain: 'optigroup.pl',
    href: '/case-study-opti-group.html',
    image: opti,
    alt: 'Strona główna Opti Group z ofertą doradztwa finansowego',
  },
  {
    name: 'Woodbud',
    trade: 'Zakład stolarski',
    summary: 'Galeria realizacji i przejrzysta wycena, dzięki którym strona pracuje jak handlowiec.',
    tags: ['Galeria', 'Wycena'],
    domain: 'woodbud.pl',
    href: '/case-study-woodbud.html',
    image: woodbud,
    alt: 'Strona Woodbud z galerią mebli na wymiar',
  },
  {
    name: 'Patrycja Górska',
    trade: 'Gabinet psychoterapii, Gdańsk',
    summary: 'Spokojny design i prosta komunikacja, które ułatwiają pierwszy kontakt z gabinetem.',
    tags: ['Projekt graficzny', 'Treści'],
    domain: 'patrycjagorska.pl',
    href: '/case-study-patrycja-gorska.html',
    image: gorska,
    alt: 'Strona gabinetu psychoterapii Patrycji Górskiej',
  },
  {
    name: 'Centrum Szkoleń Kierowców',
    trade: 'Szkolenia Kod 95',
    summary: 'Dwa oddziały i terminy szkoleń ułożone tak, że kierowca trafia na właściwy kurs bez pomyłek.',
    tags: ['Terminarz', 'Dwa oddziały'],
    domain: 'szkoleniakierowcy.pl',
    href: '/case-study-szkolenia-kierowcy.html',
    image: kierowcy,
    alt: 'Strona Centrum Szkoleń Kierowców z terminami kursów',
  },
  {
    name: 'drgil.pl',
    trade: 'Medycyna estetyczna · redesign cennika',
    summary: 'Zamiast przewijać 24 000 pikseli, pacjent rozwija tylko potrzebną kategorię cennika, także na telefonie.',
    tags: ['UX', 'Redesign'],
    domain: 'drgil.pl',
    href: '/case-study-drgil.html',
    image: drgil,
    alt: 'Cennik drgil.pl po redesignie',
    home: false,
  },
];

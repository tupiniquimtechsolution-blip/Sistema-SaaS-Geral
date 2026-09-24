// Isolated demo catalog. Imported only when VITE_DEMO_CATALOG=true.
// Never used as production seed.

import type { Service } from './data';

export const DEMO_CATALOG_WARNING = 'Catálogo demonstrativo — não é fonte de produção.';

export const demoServices: Service[] = [
  {
    id: '33333333-0000-4000-8000-000000000001',
    name: 'Design de Sobrancelhas',
    slug: 'design-sobrancelhas',
    description: DEMO_CATALOG_WARNING,
    duration: 45,
    price: 60,
    category: 'Sobrancelhas',
  },
  {
    id: '33333333-0000-4000-8000-000000000002',
    name: 'Micropigmentação de Sobrancelhas',
    slug: 'micropigmentacao-sobrancelhas',
    description: DEMO_CATALOG_WARNING,
    duration: 120,
    price: 450,
    category: 'Sobrancelhas',
  },
  {
    id: '33333333-0000-4000-8000-000000000003',
    name: 'Extensão de Cílios',
    slug: 'extensao-cilios',
    description: DEMO_CATALOG_WARNING,
    duration: 90,
    price: 180,
    category: 'Cílios',
  },
  {
    id: '33333333-0000-4000-8000-000000000004',
    name: 'Lash Lifting',
    slug: 'lash-lifting',
    description: DEMO_CATALOG_WARNING,
    duration: 60,
    price: 120,
    category: 'Cílios',
  },
  {
    id: '33333333-0000-4000-8000-000000000005',
    name: 'Limpeza de Pele Profunda',
    slug: 'limpeza-pele',
    description: DEMO_CATALOG_WARNING,
    duration: 75,
    price: 150,
    category: 'Facial',
  },
  {
    id: '33333333-0000-4000-8000-000000000006',
    name: 'Peeling de Diamante',
    slug: 'peeling-diamante',
    description: DEMO_CATALOG_WARNING,
    duration: 60,
    price: 200,
    category: 'Facial',
  },
  {
    id: '33333333-0000-4000-8000-000000000007',
    name: 'Massagem Relaxante',
    slug: 'massagem-relaxante',
    description: DEMO_CATALOG_WARNING,
    duration: 60,
    price: 130,
    category: 'Corporal',
  },
  {
    id: '33333333-0000-4000-8000-000000000008',
    name: 'Drenagem Linfática',
    slug: 'drenagem-linfatica',
    description: DEMO_CATALOG_WARNING,
    duration: 60,
    price: 140,
    category: 'Corporal',
  },
];

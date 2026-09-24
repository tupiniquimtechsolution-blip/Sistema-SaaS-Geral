import { tryGetSupabaseClient } from './supabase/client';

export interface CatalogService {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  priceCents: number;
  category: string;
  categoryId?: string;
}

export interface CatalogProfessional {
  id: string;
  name: string;
  bio: string;
}

const CONFIRMED_PROFESSIONAL: CatalogProfessional = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Vanessa Braz',
  bio: 'PENDENTE_DE_CONFIRMACAO',
};

function demoCatalogEnabled(): boolean {
  return import.meta.env.VITE_DEMO_CATALOG === 'true';
}

async function loadDemoCatalog(): Promise<{
  services: CatalogService[];
  professionals: CatalogProfessional[];
  source: 'demo';
}> {
  const mod = await import('./demo-data');
  return {
    source: 'demo',
    professionals: [CONFIRMED_PROFESSIONAL],
    services: mod.demoServices.map((service) => ({
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      duration: service.duration,
      price: service.price,
      priceCents: Math.round(service.price * 100),
      category: service.category,
    })),
  };
}

export async function loadCatalog(): Promise<{
  services: CatalogService[];
  professionals: CatalogProfessional[];
  source: 'supabase' | 'demo' | 'empty';
}> {
  const supabase = tryGetSupabaseClient();
  if (supabase) {
    const [{ data: serviceRows, error: serviceError }, { data: professionalRows }] = await Promise.all([
      supabase
        .from('services')
        .select('id, name, slug, description, duration_minutes, price_cents, category_id, service_categories(name)')
        .eq('active', true)
        .order('sort_order'),
      supabase.from('professionals').select('id, display_name, bio').eq('active', true).order('sort_order'),
    ]);

    if (!serviceError) {
      const services: CatalogService[] = (serviceRows ?? []).map((row: Record<string, unknown>) => {
        const categoryRel = row.service_categories as { name?: string } | { name?: string }[] | null;
        const categoryName = Array.isArray(categoryRel) ? categoryRel[0]?.name : categoryRel?.name;
        return {
          id: String(row.id),
          name: String(row.name),
          slug: String(row.slug),
          description: String(row.description ?? ''),
          duration: Number(row.duration_minutes),
          priceCents: Number(row.price_cents),
          price: Number(row.price_cents) / 100,
          category: categoryName || 'Serviços',
          categoryId: String(row.category_id),
        };
      });
      const professionals: CatalogProfessional[] = (professionalRows ?? []).map((row: Record<string, unknown>) => ({
        id: String(row.id),
        name: String(row.display_name),
        bio: String(row.bio ?? ''),
      }));
      return {
        services,
        professionals: professionals.length ? professionals : [CONFIRMED_PROFESSIONAL],
        source: 'supabase',
      };
    }
  }

  if (demoCatalogEnabled()) {
    return loadDemoCatalog();
  }

  return { services: [], professionals: [CONFIRMED_PROFESSIONAL], source: 'empty' };
}

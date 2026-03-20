import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareStore {
  slugs: string[];
  addSlug: (slug: string) => void;
  removeSlug: (slug: string) => void;
  clearSlugs: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      slugs: [],

      addSlug: (slug) => {
        const { slugs } = get();
        if (slugs.length >= 3 || slugs.includes(slug)) return;
        set({ slugs: [...slugs, slug] });
      },

      removeSlug: (slug) => {
        set({ slugs: get().slugs.filter(s => s !== slug) });
      },

      clearSlugs: () => set({ slugs: [] }),
    }),
    { name: 'agripoint-compare' }
  )
);

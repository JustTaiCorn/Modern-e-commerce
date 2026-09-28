export interface Category {
  id: number;
  parentId?: number | Category | null;
  parent?: Category | null;
  name: string;
  slug: string;
  isActive: boolean;
  children?: Category[];
}

// シークエンス（テクニック）のデータ型定義
export type Technique = {
  id: string;
  performance_id: string;
  name: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type NewTechnique = Omit<Technique, "id" | "created_at" | "updated_at">;
export type UpdateTechnique = Partial<NewTechnique>;

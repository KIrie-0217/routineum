import { getSupabaseClient } from "@/lib/supabase/client";
import {
  Technique,
  NewTechnique,
  UpdateTechnique,
} from "@/types/models/technique";

const supabase = getSupabaseClient();

// 特定のルーチンに関連するシークエンスの一覧を取得
export async function getTechniquesByPerformanceId(
  performanceId: string
): Promise<Technique[]> {
  const { data, error } = await supabase
    .from("techniques")
    .select("*")
    .eq("performance_id", performanceId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching techniques:", error);
    throw new Error("シークエンスの取得に失敗しました");
  }

  return data as Technique[];
}

// 特定のシークエンスを取得
export async function getTechniqueById(id: string): Promise<Technique> {
  const { data, error } = await supabase
    .from("techniques")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching technique:", error);
    throw new Error("シークエンスの取得に失敗しました");
  }

  return data as Technique;
}

// 新しいシークエンスを作成
export async function createTechnique(
  technique: NewTechnique
): Promise<Technique> {
  const { data, error } = await supabase
    .from("techniques")
    .insert(technique)
    .select()
    .single();

  if (error) {
    console.error("Error creating technique:", error);
    throw new Error("シークエンスの作成に失敗しました");
  }

  return data as Technique;
}

// シークエンスを更新
export async function updateTechnique(
  id: string,
  updates: UpdateTechnique
): Promise<Technique> {
  const { data, error } = await supabase
    .from("techniques")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating technique:", error);
    throw new Error("シークエンスの更新に失敗しました");
  }

  return data as Technique;
}

// シークエンスを削除
export async function deleteTechnique(id: string): Promise<void> {
  const { error } = await supabase.from("techniques").delete().eq("id", id);

  if (error) {
    console.error("Error deleting technique:", error);
    throw new Error("シークエンスの削除に失敗しました");
  }
}

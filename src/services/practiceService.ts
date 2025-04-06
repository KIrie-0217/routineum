import { getSupabaseClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";

type PerformancePractice =
  Database["public"]["Tables"]["performance_practices"]["Insert"];
type TechniquePractice =
  Database["public"]["Tables"]["technique_practices"]["Insert"];

const supabase = getSupabaseClient();

// ルーチン練習記録の作成
export async function createPerformancePractice(
  practice: Omit<PerformancePractice, "id" | "created_at" | "practice_date">
) {
  const { data, error } = await supabase
    .from("performance_practices")
    .insert({
      ...practice,
      practice_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// シークエンス練習記録の作成
export async function createTechniquePractice(
  practice: Omit<TechniquePractice, "id" | "created_at" | "practice_date">
) {
  const { data, error } = await supabase
    .from("technique_practices")
    .insert({
      ...practice,
      practice_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// ルーチン練習記録の取得（ページネーション対応）
export async function getPerformancePractices(
  performanceId: string,
  page = 1,
  pageSize = 10
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("performance_practices")
    .select("*", { count: "exact" })
    .eq("performance_id", performanceId)
    .order("practice_date", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    practices: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// シークエンス練習記録の取得（ページネーション対応）
export async function getTechniquePractices(
  techniqueId: string,
  page = 1,
  pageSize = 5
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("technique_practices")
    .select("*", { count: "exact" })
    .eq("technique_id", techniqueId)
    .order("practice_date", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    practices: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// ルーチンの全練習記録を取得（グラフ用）
export async function getAllPerformancePractices(performanceId: string) {
  const { data, error } = await supabase
    .from("performance_practices")
    .select("id, success_rate, practice_date")
    .eq("performance_id", performanceId)
    .order("practice_date", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

// シークエンスの全練習記録を取得（グラフ用）
export async function getAllTechniquePractices(techniqueId: string) {
  const { data, error } = await supabase
    .from("technique_practices")
    .select("id, success_rate, practice_date")
    .eq("technique_id", techniqueId)
    .order("practice_date", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

// ルーチン練習記録の削除
export async function deletePerformancePractice(practiceId: string) {
  const { error } = await supabase
    .from("performance_practices")
    .delete()
    .eq("id", practiceId);

  if (error) {
    throw error;
  }

  return true;
}

// シークエンス練習記録の削除
export async function deleteTechniquePractice(practiceId: string) {
  const { error } = await supabase
    .from("technique_practices")
    .delete()
    .eq("id", practiceId);

  if (error) {
    throw error;
  }

  return true;
}

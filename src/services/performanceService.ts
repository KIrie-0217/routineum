import { supabase } from "@/lib/supabase/client";
import {
  Performance,
  NewPerformance,
  UpdatePerformance,
} from "@/types/models/performance";

// 特定のユーザーのルーチン一覧を取得
export async function getPerformances(userId: string): Promise<Performance[]> {
  const { data, error } = await supabase
    .from("performances")
    .select("*")
    .eq("user_id", userId)
    .order("performance_date", { ascending: true });

  if (error) {
    console.error("Error fetching performances:", error);
    throw new Error(`ルーチンの取得に失敗しました: ${error.message}`);
  }

  return data as Performance[];
}

// 特定のルーチンを取得
export async function getPerformance(id: string): Promise<Performance> {
  const { data, error } = await supabase
    .from("performances")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching performance:", error);
    throw new Error(`ルーチンの取得に失敗しました: ${error.message}`);
  }

  return data as Performance;
}

// 新しいルーチンを作成
export async function createPerformance(
  performance: NewPerformance
): Promise<Performance> {
  // 数値フィールドの処理
  const processedData = {
    ...performance,
    result_percentage:
      performance.result_percentage === null ||
      performance.result_percentage === undefined
        ? null
        : Number(performance.result_percentage),
    ranking:
      performance.ranking === null || performance.ranking === undefined
        ? null
        : Number(performance.ranking),
  };

  console.log("Creating performance with data:", processedData);

  // まず、ユーザーが存在するか確認
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("id", processedData.user_id)
    .single();

  if (userError) {
    console.error("Error checking user existence:", userError);

    // ユーザーが存在しない場合は作成を試みる
    if (userError.code === "PGRST116") {
      // データが見つからない場合
      const { error: insertUserError } = await supabase.from("users").insert({
        id: processedData.user_id,
        email: "auto-created@example.com", // 仮のメールアドレス
      });

      if (insertUserError) {
        console.error("Error creating user record:", insertUserError);
        throw new Error(
          `ユーザーの作成に失敗しました: ${insertUserError.message}`
        );
      }

      console.log("Created new user record for performance creation");
    } else {
      throw new Error(`ユーザーの確認に失敗しました: ${userError.message}`);
    }
  }

  // ルーチンを作成
  const { data, error } = await supabase
    .from("performances")
    .insert(processedData)
    .select()
    .single();

  if (error) {
    console.error("Error creating performance:", error);
    throw new Error(`ルーチンの作成に失敗しました: ${error.message}`);
  }

  if (!data) {
    throw new Error("ルーチンの作成に失敗しました: データが返されませんでした");
  }

  return data as Performance;
}

// ルーチンを更新
export async function updatePerformance(
  id: string,
  updates: UpdatePerformance
): Promise<Performance> {
  // 数値フィールドの処理
  const processedUpdates = {
    ...updates,
    result_percentage:
      updates.result_percentage === null ||
      updates.result_percentage === undefined
        ? null
        : Number(updates.result_percentage),
    ranking:
      updates.ranking === null || updates.ranking === undefined
        ? null
        : Number(updates.ranking),
  };

  const { data, error } = await supabase
    .from("performances")
    .update(processedUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating performance:", error);
    throw new Error(`ルーチンの更新に失敗しました: ${error.message}`);
  }

  return data as Performance;
}

// ルーチンを削除
export async function deletePerformance(id: string): Promise<void> {
  const { error } = await supabase.from("performances").delete().eq("id", id);

  if (error) {
    console.error("Error deleting performance:", error);
    throw new Error(`ルーチンの削除に失敗しました: ${error.message}`);
  }
}

// 完了したルーチンの数を取得
export async function getCompletedPerformancesCount(
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("performances")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_completed", true);

  if (error) {
    console.error("Error counting completed performances:", error);
    throw new Error(
      `完了したルーチンの数の取得に失敗しました: ${error.message}`
    );
  }

  return count || 0;
}

// 予定されているルーチンの数を取得
export async function getUpcomingPerformancesCount(
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("performances")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_completed", false);

  if (error) {
    console.error("Error counting upcoming performances:", error);
    throw new Error(
      `予定されているルーチンの数の取得に失敗しました: ${error.message}`
    );
  }

  return count || 0;
}

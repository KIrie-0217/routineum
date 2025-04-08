import { getSupabaseClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";
import { fetchWithRetry } from "@/utils/supabaseUtils";
import { SupabaseClient } from "@supabase/supabase-js";
import { number, string } from "zod";

export async function fetchPractices(
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<{ success_rate: number; practice_date: string }[]> {
  const supabaseQuery = supabase
    .from("performances")
    .select("id")
    .eq("user_id", userId);
  const { data: performances, error: fetchError } = await fetchWithRetry(
    supabaseQuery,
    {
      maxRetries: 3,
      timeoutMs: 500,
      exponentialBackoff: true,
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt} checking performance`, error);
      },
    }
  );

  if (!performances || performances.length === 0) return [];

  const performanceIds = performances.map((p) => p.id);

  // ルーチン練習記録を取得
  const performancePracticesQuery = supabase
    .from("performance_practices")
    .select("success_rate, practice_date")
    .in("performance_id", performanceIds);

  const { data: perfPractices, error: _ } = await fetchWithRetry(
    performancePracticesQuery,
    {
      maxRetries: 5,
      timeoutMs: 500,
      exponentialBackoff: true,
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt} checking user existence:`, error);
      },
    }
  );

  return perfPractices || [];
}

export async function getUserId(
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<string> {
  try {
    console.log(`Fetching user ID for user ${userId}`);

    // タイムアウト付きでクエリを実行
    const result = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    const { data, error } = result;

    if (error) {
      console.error("Error fetching user ID:", error);
      throw new Error(`ユーザーIDの取得に失敗しました: ${error.message}`);
    }

    console.log(`User ID: ${data.id}`);
    return data.id;
  } catch (error) {
    console.error("Exception in getUserId:", error);
    return "";
  }
}

// ルーチンの総数を取得
export async function getTotalPerformancesCount(
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<number> {
  try {
    console.log(`Fetching performance count for user ${userId}`);

    const result = await supabase
      .from("performances")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const { count, error } = result;

    if (error) {
      console.error("Error counting performances:", error);
      throw new Error(`ルーチン数の取得に失敗しました: ${error.message}`);
    }

    console.log(`Performance count: ${count || 0}`);
    return count || 0;
  } catch (error) {
    console.error("Exception in getTotalPerformancesCount:", error);
    // エラーが発生しても0を返す（UIがクラッシュしないように）
    return 0;
  }
}

// シークエンスの総数を取得
export async function getTotalTechniquesCount(
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<number> {
  try {
    console.log(`Fetching practice session count for user ${userId}`);

    // ユーザーに関連するルーチンIDを取得
    const perfResult = await supabase
      .from("performances")
      .select("id")
      .eq("user_id", userId);

    const { data: performances, error: perfError } = perfResult;

    if (perfError) {
      console.error(
        "Error fetching performances for practice count:",
        perfError
      );
      throw new Error(
        `練習セッション数の取得に失敗しました: ${perfError.message}`
      );
    }

    if (!performances || performances.length === 0) {
      console.log("No performances found, practice session count is 0");
      return 0; // ルーチンがない場合は練習セッションも0
    }

    // ルーチンIDの配列を作成
    const performanceIds = performances.map((p) => p.id);
    console.log(
      `Found ${performanceIds.length} performances, fetching practice counts`
    );

    // ルーチンIDに関連するシークエンスIDを取得（タイムアウト付き）
    const techResult = await supabase
      .from("techniques")
      .select("id")
      .in("performance_id", performanceIds);

    const { data: techniques, error: techError } = techResult;

    if (techError) {
      console.error("Error fetching techniques for practice count:", techError);
      throw new Error(
        `シークエンス練習数の取得に失敗しました: ${techError.message}`
      );
    }

    // シークエンスIDの配列を作成
    const techniqueIds = techniques.map((t) => t.id);
    console.log(
      `Found ${techniqueIds.length} techniques, fetching technique practice count`
    );

    // シークエンス練習の数を取得（タイムアウト付き）
    const techPracticeResult = await supabase
      .from("technique_practices")
      .select("*", { count: "exact", head: true })
      .in("technique_id", techniqueIds);

    const { count: techPracticeCount, error: techPracticeError } =
      techPracticeResult;

    if (techPracticeError) {
      console.error("Error counting technique practices:", techPracticeError);
      throw new Error(
        `シークエンス練習数の取得に失敗しました: ${techPracticeError.message}`
      );
    }

    console.log(`Technique practice count: ${techPracticeCount || 0}`);

    // ルーチン練習とシークエンス練習の合計を返す
    const totalCount = techPracticeCount || 0;
    console.log(`Total practice count: ${totalCount}`);
    return totalCount;
  } catch (error) {
    console.error("Exception in getTotalPracticeSessionsCount:", error);
    // エラーが発生しても0を返す（UIがクラッシュしないように）
    return 0;
  }
}

// 練習セッションの総数を取得（ルーチン練習とシークエンス練習の合計）
export async function getTotalPracticeSessionsCount(
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<number> {
  try {
    console.log(`Fetching practice session count for user ${userId}`);

    // ユーザーに関連するルーチンIDを取得（タイムアウト付き）
    const perfResult = await supabase
      .from("performances")
      .select("id")
      .eq("user_id", userId);

    const { data: performances, error: perfError } = perfResult;

    if (perfError) {
      console.error(
        "Error fetching performances for practice count:",
        perfError
      );
      throw new Error(
        `練習セッション数の取得に失敗しました: ${perfError.message}`
      );
    }

    if (!performances || performances.length === 0) {
      console.log("No performances found, practice session count is 0");
      return 0; // ルーチンがない場合は練習セッションも0
    }

    // ルーチンIDの配列を作成
    const performanceIds = performances.map((p) => p.id);
    console.log(
      `Found ${performanceIds.length} performances, fetching practice counts`
    );

    // ルーチン練習の数を取得（タイムアウト付き）
    const perfPracticeResult = await supabase
      .from("performance_practices")
      .select("*", { count: "exact", head: true })
      .in("performance_id", performanceIds);

    const { count: perfPracticeCount, error: perfPracticeError } =
      perfPracticeResult;

    if (perfPracticeError) {
      console.error("Error counting performance practices:", perfPracticeError);
      throw new Error(
        `ルーチン練習数の取得に失敗しました: ${perfPracticeError.message}`
      );
    }

    console.log(`Performance practice count: ${perfPracticeCount || 0}`);

    console.log(`Total practice session count: ${perfPracticeCount}`);
    return perfPracticeCount || 0;
  } catch (error) {
    console.error("Exception in getTotalPracticeSessionsCount:", error);
    // エラーが発生しても0を返す（UIがクラッシュしないように）
    return 0;
  }
}

// 最近のルーチンを取得（最大5件）
export async function getRecentPerformances(
  userId: string,
  limit: number = 5,
  supabase: SupabaseClient<Database>
): Promise<any[]> {
  try {
    console.log(
      `Fetching recent performances for user ${userId} with limit ${limit}`
    );

    const result = await supabase
      .from("performances")
      .select("*")
      .eq("user_id", userId)
      .order("performance_date", { ascending: true })
      .limit(limit);

    const { data, error } = result;

    if (error) {
      console.error("Error fetching recent performances:", error);
      throw new Error(`最近のルーチンの取得に失敗しました: ${error.message}`);
    }

    console.log(`Retrieved ${data?.length || 0} recent performances`);
    return data || [];
  } catch (error) {
    console.error("Exception in getRecentPerformances:", error);
    // エラーが発生しても空の配列を返す（UIがクラッシュしないように）
    return [];
  }
}

import { Database } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";
import { subDays } from "date-fns";

export type totalCotributionData = {
  techniquePractices: {
    id: string;
    practice_date: string;
    technique_id: string;
    techniques: { performance_id: string };
  }[];
  performancePractices: {
    id: string;
    practice_date: string;
    performance_id: string;
  }[];
};

export type performanceCotributionData = {
  techniquePractices: {
    id: string;
    practice_date: string;
  }[];
  performancePractices: {
    id: string;
    practice_date: string;
  }[];
};

// ユーザーの全ての練習記録を取得する関数
export async function getUserPracticeContributions(
  userId: string,
  days = 365,
  supabase: SupabaseClient<Database>
) {
  try {
    if (!userId) {
      console.error("getUserPracticeContributions: userId is missing");
      return {
        techniquePractices: [],
        performancePractices: [],
      };
    }

    const startDate = subDays(new Date(), days).toISOString();

    // まずユーザーのルーチンを取得
    const { data: performances, error: performancesError } = await supabase
      .from("performances")
      .select("id")
      .eq("user_id", userId);

    if (performancesError) {
      console.error("Error fetching performances:", performancesError);
      throw performancesError;
    }

    // ユーザーのルーチンがない場合は空の結果を返す
    if (!performances || performances.length === 0) {
      console.log("No performances found for user:", userId);
      return {
        techniquePractices: [],
        performancePractices: [],
      };
    }

    const performanceIds = performances.map((p) => p.id);

    // ルーチンに関連するシークエンスを取得
    const { data: techniques, error: techniquesError } = await supabase
      .from("techniques")
      .select("id")
      .in("performance_id", performanceIds);

    if (techniquesError) {
      console.error("Error fetching techniques:", techniquesError);
      throw techniquesError;
    }

    const techniqueIds = techniques?.map((t) => t.id) || [];

    // シークエンスの練習記録を取得
    let techniquePractices:
      | {
          id: string;
          practice_date: string;
          technique_id: string;
          techniques: {
            performance_id: string;
          };
        }[]
      | [] = [];

    if (techniqueIds.length > 0) {
      const { data, error: techniqueError } = await supabase
        .from("technique_practices")
        .select(
          `
          id,
          practice_date,
          technique_id,
          techniques:technique_id(performance_id)
        `
        )
        .in("technique_id", techniqueIds)
        .gte("practice_date", startDate)
        .order("practice_date", { ascending: true });

      if (techniqueError) {
        console.error("Error fetching technique practices:", techniqueError);
        throw techniqueError;
      }

      techniquePractices = data || [];
    }

    // ルーチンの練習記録を取得
    const { data: performancePractices, error: performanceError } =
      await supabase
        .from("performance_practices")
        .select(
          `
        id,
        practice_date,
        performance_id
      `
        )
        .in("performance_id", performanceIds)
        .gte("practice_date", startDate)
        .order("practice_date", { ascending: true });

    if (performanceError) {
      console.error("Error fetching performance practices:", performanceError);
      throw performanceError;
    }

    return {
      techniquePractices: techniquePractices,
      performancePractices: performancePractices || [],
    };
  } catch (error) {
    console.error("Error in getUserPracticeContributions:", error);
    throw error; // エラーを再スローして呼び出し元で処理できるようにする
  }
}

// 特定のルーチンに関連する全ての練習記録を取得する関数
export async function getPerformanceContributions(
  performanceId: string,
  days = 365,
  supabase: SupabaseClient<Database>
) {
  const startDate = subDays(new Date(), days).toISOString();

  // ルーチンに関連するシークエンスのIDを取得
  const { data: techniques, error: techniquesError } = await supabase
    .from("techniques")
    .select("id")
    .eq("performance_id", performanceId);

  if (techniquesError) {
    throw techniquesError;
  }

  const techniqueIds = techniques?.map((t) => t.id) || [];

  // シークエンスの練習記録を取得
  const { data: techniquePractices, error: techniqueError } = await supabase
    .from("technique_practices")
    .select("id, practice_date")
    .in("technique_id", techniqueIds)
    .gte("practice_date", startDate)
    .order("practice_date", { ascending: true });

  if (techniqueError) {
    throw techniqueError;
  }

  // ルーチンの練習記録を取得
  const { data: performancePractices, error: performanceError } = await supabase
    .from("performance_practices")
    .select("id, practice_date")
    .eq("performance_id", performanceId)
    .gte("practice_date", startDate)
    .order("practice_date", { ascending: true });

  if (performanceError) {
    throw performanceError;
  }

  return {
    techniquePractices: techniquePractices || [],
    performancePractices: performancePractices || [],
  };
}

// ユーザーの全てのルーチンに関連する練習記録を取得する関数
export async function getAllUserPerformanceContributions(
  userId: string,
  days = 365,
  supabase: SupabaseClient<Database>
) {
  const startDate = subDays(new Date(), days).toISOString();

  // ユーザーの全てのルーチンIDを取得
  const { data: performances, error: performancesError } = await supabase
    .from("performances")
    .select("id")
    .eq("user_id", userId);

  if (performancesError) {
    throw performancesError;
  }

  const performanceIds = performances?.map((p) => p.id) || [];

  if (performanceIds.length === 0) {
    return {
      techniquePractices: [],
      performancePractices: [],
    };
  }

  // ルーチンに関連する全てのシークエンスIDを取得
  const { data: techniques, error: techniquesError } = await supabase
    .from("techniques")
    .select("id")
    .in("performance_id", performanceIds);

  if (techniquesError) {
    throw techniquesError;
  }

  const techniqueIds = techniques?.map((t) => t.id) || [];

  // シークエンスの練習記録を取得
  const { data: techniquePractices, error: techniqueError } = await supabase
    .from("technique_practices")
    .select("id, practice_date")
    .in("technique_id", techniqueIds)
    .gte("practice_date", startDate)
    .order("practice_date", { ascending: true });

  if (techniqueError) {
    throw techniqueError;
  }

  // ルーチンの練習記録を取得
  const { data: performancePractices, error: performanceError } = await supabase
    .from("performance_practices")
    .select("id, practice_date")
    .in("performance_id", performanceIds)
    .gte("practice_date", startDate)
    .order("practice_date", { ascending: true });

  if (performanceError) {
    throw performanceError;
  }

  return {
    techniquePractices: techniquePractices || [],
    performancePractices: performancePractices || [],
  };
}

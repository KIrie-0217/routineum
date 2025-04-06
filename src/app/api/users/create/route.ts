import { createClient } from "@/lib/supabase/seves_side_client";
import { NextRequest, NextResponse } from "next/server";

// レスポンスヘルパー関数
function createApiResponse(data: any, status: number = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(req: NextRequest) {
  console.log("API: /api/users/create called");

  try {
    const supabase = await createClient();

    // 現在のセッションを取得
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("API: Session error:", sessionError);
      return createApiResponse(
        {
          error: "セッションの取得に失敗しました",
          details: JSON.stringify(sessionError),
        },
        500
      );
    }

    const session = sessionData?.session;

    if (!session) {
      console.log("API: No session found in API context");

      // リクエストヘッダーからユーザーIDを取得（クライアントから送信された場合）
      const userId = req.headers.get("x-user-id");
      if (userId) {
        console.log(`API: Using user ID from header: ${userId}`);

        // リクエストボディからデータを取得
        let forceCreate = false;
        let email = "";

        try {
          const requestText = await req.text();
          console.log(
            `API: Request body received (${requestText.length} bytes)`
          );

          if (requestText && requestText.trim()) {
            const requestData = JSON.parse(requestText);
            forceCreate = requestData?.forceCreate || false;
            email = requestData?.email || "";
          }
        } catch (e) {
          console.warn("API: Failed to parse request body:", e);
        }

        // ユーザー情報を取得
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .single();

        if (!userError && !forceCreate) {
          console.log("API: User already exists (from header ID):", userData);
          return createApiResponse({
            message: "ユーザーは既に存在します",
            user: userData,
          });
        }

        if (userError?.code === "PGRST116" || forceCreate) {
          console.log("API: Creating user record for ID from header:", userId);

          const { error: insertError } = await supabase.from("users").upsert(
            {
              id: userId,
              email: email || "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

          const { data: newUserData, error: newUserError } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

          if (newUserError) {
            console.error(
              "API: Error fetching newly created user:",
              newUserError
            );
            return createApiResponse(
              {
                error: "作成したユーザーの取得に失敗しました",
                details: JSON.stringify(newUserError),
              },
              500
            );
          }

          console.log(
            "API: User created successfully (from header ID):",
            newUserData
          );
          return createApiResponse({
            message: "ユーザーレコードを作成しました",
            user: newUserData,
          });
        }

        return createApiResponse(
          {
            error: "ユーザー情報の取得に失敗しました",
            details: JSON.stringify(userError),
          },
          500
        );
      }

      return createApiResponse({ error: "ログインしていません" }, 401);
    }

    console.log(`API: Session found for user ${session.user.id}`);

    // リクエストボディからデータを取得
    let forceCreate = false;
    try {
      const requestText = await req.text();
      console.log(`API: Request body received (${requestText.length} bytes)`);

      if (requestText && requestText.trim()) {
        const requestData = JSON.parse(requestText);
        forceCreate = requestData?.forceCreate || false;
      }
    } catch (e) {
      console.warn("API: Failed to parse request body:", e);
      // リクエストボディのパースに失敗しても処理を続行
    }

    console.log(
      `API: Processing user record for ${session.user.id}, forceCreate: ${forceCreate}`
    );

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    // ユーザーが既に存在し、強制作成フラグがない場合
    if (!userError && !forceCreate) {
      console.log("API: User already exists:", userData);
      return createApiResponse({
        message: "ユーザーは既に存在します",
        user: userData,
      });
    }

    // ユーザーが存在しないか、強制作成フラグがある場合
    if (userError?.code === "PGRST116" || forceCreate) {
      console.log("API: Creating user record for", session.user.id);

      // 直接SQLを実行してユーザーを作成
      const { error: insertError } = await supabase.from("users").upsert(
        {
          id: session.user.id,
          email: session.user.email || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (insertError) {
        console.error("API: Error creating user record:", insertError);

        // SQL文を直接実行してみる
        const { error: sqlError } = await supabase.rpc("insert_user_directly", {
          p_user_id: session.user.id,
          p_email: session.user.email || "",
          p_created_at: new Date().toISOString(),
        });

        if (sqlError) {
          console.error("API: SQL error during user creation:", sqlError);
          return createApiResponse(
            {
              error: "ユーザーレコードの作成に失敗しましたaaaaa",
              details: {
                insertError: JSON.stringify(insertError),
                sqlError: JSON.stringify(sqlError),
              },
            },
            500
          );
        }
      }

      // 作成後に再度ユーザー情報を取得
      const { data: newUserData, error: newUserError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (newUserError) {
        console.error("API: Error fetching newly created user:", newUserError);
        return createApiResponse(
          {
            error: "作成したユーザーの取得に失敗しました",
            details: JSON.stringify(newUserError),
          },
          500
        );
      }

      console.log("API: User created successfully:", newUserData);
      return createApiResponse({
        message: "ユーザーレコードを作成しました",
        user: newUserData,
      });
    }

    // その他のエラー
    console.error("API: Other error during user fetch:", userError);
    return createApiResponse(
      {
        error: "ユーザー情報の取得に失敗しました",
        details: JSON.stringify(userError),
      },
      500
    );
  } catch (error) {
    console.error("API: Unexpected error in user creation:", error);
    return createApiResponse(
      {
        error: "予期しないエラーが発生しました",
        details: String(error),
      },
      500
    );
  }
}

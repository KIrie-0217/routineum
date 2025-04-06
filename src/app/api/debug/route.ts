import { createClient } from "@/lib/supabase/seves_side_client";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // クッキーからセッションを取得 - cookies()を非同期で使用
    const supabase = await createClient();
    // 現在のセッションを取得
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json(
        { error: "セッションの取得に失敗しました", details: sessionError },
        { status: 500 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "ログインしていません" },
        { status: 401 }
      );
    }

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (userError) {
      console.log("User error:", userError);

      // ユーザーレコードが存在しない場合は作成を試みる
      if (userError.code === "PGRST116") {
        console.log("User not found, attempting to create");

        // 直接SQLを実行してユーザーを作成（RLSをバイパス）
        const { data: insertData, error: insertError } = await supabase.rpc(
          "create_user_safely",
          {
            user_id: session.user.id,
            user_email: session.user.email || "",
            user_created_at: new Date().toISOString(),
          }
        );

        if (insertError) {
          console.error("Error creating user via RPC:", insertError);

          // 詳細なエラー情報を返す
          return NextResponse.json(
            {
              error: "ユーザーレコードの作成に失敗しました",
              details: insertError,
              session: session,
              message: "RPC関数でのユーザー作成に失敗しました",
            },
            { status: 500 }
          );
        }

        // 作成後に再度ユーザー情報を取得
        const { data: newUserData, error: newUserError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (newUserError) {
          return NextResponse.json(
            {
              error: "作成したユーザーの取得に失敗しました",
              details: newUserError,
              session: session,
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          message: "ユーザーレコードを作成しました",
          user: newUserData,
          session: session,
          rpc_result: insertData,
        });
      }

      return NextResponse.json(
        {
          error: "ユーザー情報の取得に失敗しました",
          details: userError,
          session: session,
        },
        { status: 500 }
      );
    }

    // 成功レスポンス
    return NextResponse.json({
      message: "デバッグ情報",
      user: userData,
      session: session,
    });
  } catch (error) {
    console.error("Unexpected error in debug route:", error);
    return NextResponse.json(
      { error: "予期しないエラーが発生しました", details: error },
      { status: 500 }
    );
  }
}

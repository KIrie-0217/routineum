-- ユーザーレコードを安全に作成するためのストアドプロシージャ
CREATE OR REPLACE FUNCTION create_user_safely(
  user_id UUID,
  user_email TEXT,
  user_created_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- 関数の所有者の権限で実行（RLSをバイパス）
AS $$
BEGIN
  -- ユーザーが存在するか確認
  IF EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
    RETURN TRUE; -- すでに存在する場合は成功を返す
  END IF;

  -- ユーザーレコードを挿入
  INSERT INTO public.users (id, email, created_at)
  VALUES (user_id, user_email, user_created_at);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating user record: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- ユーザーレコードを直接挿入するためのストアドプロシージャ
CREATE OR REPLACE FUNCTION insert_user_directly(
  p_user_id UUID,
  p_email TEXT,
  p_created_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- 関数の所有者の権限で実行（RLSをバイパス）
AS $$
BEGIN
  -- ユーザーが存在するか確認
  IF EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    -- 既存のユーザーを更新
    UPDATE public.users
    SET 
      email = p_email,
      updated_at = NOW()
    WHERE id = p_user_id;
  ELSE
    -- 新しいユーザーを挿入
    INSERT INTO public.users (id, email, created_at, updated_at)
    VALUES (p_user_id, p_email, p_created_at, p_created_at);
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in insert_user_directly: %', SQLERRM;
    RETURN FALSE;
END;
$$;

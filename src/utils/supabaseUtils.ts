/**
 * Supabase関連のユーティリティ関数
 */

/**
 * Supabaseクエリに対してリトライとタイムアウト処理を実装した汎用関数
 * 
 * @param queryFn - 実行するSupabaseクエリ関数
 * @param options - リトライとタイムアウトのオプション
 * @returns クエリの結果
 */
export async function executeWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: {
    maxRetries?: number;
    timeoutMs?: number;
    retryDelayMs?: number;
    exponentialBackoff?: boolean;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<{ data: T | null; error: any }> {
  const {
    maxRetries = 5,
    timeoutMs = 500,
    retryDelayMs = 1000,
    exponentialBackoff = true,
    onRetry = () => {},
  } = options;

  let retryCount = 0;
  let lastError: any = null;

  while (retryCount < maxRetries) {
    try {
      // クエリ実行とタイムアウト処理
      const fetchPromise = queryFn();
      
      const timeoutPromise = new Promise<{ data: null; error: any }>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
      });

      // Promise.raceでタイムアウト処理を実装
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      // エラーがなければ結果を返す
      if (!result.error) {
        return result;
      }
      
      // エラーを保存して次のリトライへ
      lastError = result.error;
      
    } catch (error) {
      // 例外が発生した場合も保存して次のリトライへ
      lastError = error;
    }

    // リトライカウントを増やす
    retryCount++;
    
    // 最大リトライ回数に達していなければ待機してリトライ
    if (retryCount < maxRetries) {
      // 指数バックオフを適用するかどうか
      const delay = exponentialBackoff 
        ? retryDelayMs * Math.pow(2, retryCount - 1) 
        : retryDelayMs;
      
      // リトライコールバックを呼び出し
      onRetry(retryCount, lastError);
      
      // 待機
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // 全てのリトライが失敗した場合
  return { data: null, error: lastError };
}

/**
 * Supabaseクエリを実行し、結果が見つからない場合はnullを返す
 * 
 * @param queryFn - 実行するSupabaseクエリ関数
 * @param options - リトライとタイムアウトのオプション
 * @returns クエリの結果
 */
export async function fetchWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: {
    maxRetries?: number;
    timeoutMs?: number;
    retryDelayMs?: number;
    exponentialBackoff?: boolean;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<{ data: T | null; error: any }> {
  const result = await executeWithRetry(queryFn, options);
  
  // データが見つからないエラー (PGRST116) の場合は、エラーなしでnullデータを返す
  if (result.error && result.error.code === 'PGRST116') {
    return { data: null, error: null };
  }
  
  return result;
}

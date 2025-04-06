import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

// 日付をフォーマットする関数
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy年MM月dd日', { locale: ja });
  } catch (error) {
    console.error('日付のフォーマットに失敗しました:', error);
    return dateString;
  }
}

// 相対的な日付表示（〜前、〜後）を返す関数
export function formatRelativeDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy年MM月dd日 HH:mm', { locale: ja });
  } catch (error) {
    console.error('日付のフォーマットに失敗しました:', error);
    return dateString;
  }
}

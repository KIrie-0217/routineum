'use client';

import { forwardRef, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Box, Input, useBreakpointValue } from '@chakra-ui/react';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  showTimeSelect?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
  dateFormat?: string;
  placeholderText?: string;
  isClearable?: boolean;
  disabled?: boolean;
}

// カスタム入力コンポーネント
const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, onChange, onBlur, disabled, placeholder }, ref) => (
  <Input
    value={value}
    onClick={onClick}
    onChange={onChange}
    onBlur={onBlur}
    ref={ref}
    disabled={disabled}
    placeholder={placeholder}
    readOnly={!onChange}
  />
));

CustomInput.displayName = 'CustomInput';

export default function CustomDatePicker({
  selected,
  onChange,
  showTimeSelect = false,
  timeFormat = 'HH:mm',
  timeIntervals = 15,
  dateFormat = 'yyyy/MM/dd HH:mm',
  placeholderText = '日付を選択',
  isClearable = false,
  disabled = false,
}: CustomDatePickerProps) {
  // モバイル表示かどうかを判定
  const isMobile = useBreakpointValue({ base: true, md: false });
  // モバイル表示時のカスタムクラス
  const [customClass, setCustomClass] = useState<string>('');

  useEffect(() => {
    // モバイル表示時にカスタムクラスを設定
    setCustomClass(isMobile ? 'mobile-date-picker' : '');
  }, [isMobile]);

  return (
    <Box className={`date-picker-container ${customClass}`} width="100%">
      <style jsx global>{`
        /* モバイル表示時のインラインスタイル */
        .mobile-date-picker .react-datepicker__time-container {
          width: 100%;
          border-left: none;
          border-top: 1px solid #aeaeae;
        }
        
        .mobile-date-picker .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box {
          width: 100%;
        }
      `}</style>
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        dateFormat={dateFormat}
        customInput={<CustomInput />}
        className="chakra-input"
        placeholderText={placeholderText}
        isClearable={isClearable}
        disabled={disabled}
        popperPlacement="bottom-start"
        popperProps={{
          strategy: "fixed"
        }}
      />
    </Box>
  );
}

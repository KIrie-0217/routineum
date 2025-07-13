'use client';

import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Box, Input } from '@chakra-ui/react';

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
  return (
    <Box className="date-picker-container" width="100%">
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
      />
    </Box>
  );
}

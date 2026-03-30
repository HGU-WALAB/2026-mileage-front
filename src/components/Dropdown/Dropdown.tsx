import { Size } from '@/types/style';
import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useTheme,
} from '@mui/material';
import { type HTMLAttributes, type InputHTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  // TODO: 제너릭으로 확장 가능
  items: string[];
  selectedItem: string;
  setSelectedItem: (item: string) => void;
  size?: Exclude<Size, 'large'>;
  width?: string;
  disabled?: boolean;
  /** true면 목록 외 문자열 직접 입력 가능 (Autocomplete freeSolo) */
  freeSolo?: boolean;
  /** freeSolo일 때 내부 input 요소 속성 (maxLength, aria-label 등) */
  freeSoloInputProps?: InputHTMLAttributes<HTMLInputElement>;
}

const Dropdown = ({
  label,
  items,
  selectedItem,
  setSelectedItem,
  size = 'small',
  width,
  disabled,
  freeSolo = false,
  freeSoloInputProps,
  ...props
}: Props) => {
  const theme = useTheme();
  const formControlSize = size === 'xlarge' ? 'medium' : size;

  if (freeSolo) {
    const {
      className,
      style,
      id,
      role,
      onChange: _divOnChange,
      ...restDivProps
    } = props;
    return (
      <Autocomplete
        className={className}
        style={style}
        id={id}
        role={role}
        freeSolo
        options={items}
        value={selectedItem}
        disabled={disabled}
        onChange={(_, newValue) => {
          setSelectedItem(typeof newValue === 'string' ? newValue : '');
        }}
        inputValue={selectedItem}
        onInputChange={(_, v) => setSelectedItem(v)}
        noOptionsText="일치하는 항목 없음"
        sx={{ minWidth: 120, width, boxSizing: 'border-box' }}
        renderInput={params => (
          <TextField
            {...params}
            label={label}
            size={formControlSize}
            inputProps={{
              ...params.inputProps,
              ...freeSoloInputProps,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.variant.default,
              },
            }}
          />
        )}
        {...restDivProps}
      />
    );
  }

  return (
    <FormControl sx={{ minWidth: 120, width, ...props }} size={formControlSize}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={selectedItem}
        label={label}
        onChange={e => setSelectedItem(e.target.value)}
        style={{ backgroundColor: theme.palette.variant.default }}
        disabled={disabled}
      >
        {items.map((item, index) => (
          <MenuItem value={item} key={index}>
            {item}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default Dropdown;

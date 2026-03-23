import { ButtonVariant, Color, Size } from '@/types/style';
import { palette } from '@/styles/palette';
import { getColor } from '@/utils/getColor';
import { Button as MuiButton } from '@mui/material';
import { ButtonHTMLAttributes, FunctionComponent, SVGProps } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  color?: Color;
  size?: Size | 'full';
  isRound?: boolean;
  iconPosition?: 'start' | 'end';
  icon?: FunctionComponent<SVGProps<SVGSVGElement>>;
}

const Button = ({
  label,
  variant = 'contained',
  disabled = false,
  color = 'blue',
  size = 'small',
  isRound = false,
  iconPosition = 'start',
  icon: Icon,
  children,
  ...props
}: Props) => {
  const { baseColor, hoverColor } = getColor(color);
  return (
    <MuiButton
      variant={variant}
      disabled={disabled}
      size={
        size === 'full'
          ? 'medium'
          : size === 'xlarge'
            ? 'large'
            : size
      }
      sx={{
        backgroundColor:
          variant === 'contained'
            ? baseColor
            : variant === 'outlined'
              ? palette.white
              : 'transparent',
        borderColor: variant === 'outlined' ? baseColor : 'transparent',
        ...(variant === 'outlined' || variant === 'text'
          ? {
              color: baseColor,
              '& .MuiButton-startIcon, & .MuiButton-endIcon': {
                color: 'currentColor',
              },
            }
          : {}),
        '&:hover': {
          backgroundColor:
            variant === 'contained'
              ? hoverColor
              : variant === 'outlined'
                ? palette.grey100
                : 'transparent',
          borderColor: variant === 'outlined' ? hoverColor : 'transparent',
          ...(variant === 'outlined' || variant === 'text'
            ? { color: hoverColor }
            : {}),
        },
        borderRadius: isRound ? '2.4rem' : '.75rem',
        width: size === 'full' ? '100%' : 'auto',
        height: size === 'small' ? '30px' : size === 'medium' ? '36px' : '42px',
      }}
      startIcon={iconPosition === 'start' && Icon ? <Icon /> : null}
      endIcon={iconPosition === 'end' && Icon ? <Icon /> : null}
      {...props}
    >
      {label}
      {children}
    </MuiButton>
  );
};

export default Button;

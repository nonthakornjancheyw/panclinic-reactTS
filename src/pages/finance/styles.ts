import { createStyles } from 'antd-style';

export const useStyle = createStyles(({ prefixCls, css }) => ({
  greenButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
      background: linear-gradient(90deg, #4caf50 0%, #81c784 100%) !important;
      border: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(90deg, #388e3c 0%, #66bb6a 100%) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      }
    }
  `,
  redButton: css`
    &.${prefixCls}-btn-primary.${prefixCls}-btn-dangerous:not([disabled]) {
      background: linear-gradient(90deg, #e53935 0%, #ef5350 100%) !important;
      border: none;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(90deg, #c62828 0%, #e57373 100%) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      }
    }
  `,
}));

import styles from './Skeleton.module.css';

interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  style: customStyle,
}: SkeletonProps) {
  const style = {
    width: width || undefined,
    height: height || undefined,
    ...customStyle,
  };

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={style}
      aria-label="Loading..."
    />
  );
}

type Props = { className?: string; height?: number };
export default function LoadingSkeleton({ className = "", height = 16 }: Props) {
  return <div className={`shimmer ${className}`} style={{ height }} />;
}

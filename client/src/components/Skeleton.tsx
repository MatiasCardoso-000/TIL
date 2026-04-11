interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export default function Skeleton({
  className = "",
  width,
  height,
  rounded = false,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${rounded ? "skeleton--rounded" : ""} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

// Skeleton variants for different content types
export function SkeletonPost() {
  return (
    <div className="skeleton-post">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton width={32} height={32} rounded />
        <Skeleton width={80} height={14} />
      </div>
      <Skeleton height={16} className="mb-2" />
      <Skeleton height={16} width="70%" />
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="skeleton-profile">
      <Skeleton width={80} height={80} rounded className="mb-4" />
      <Skeleton width={120} height={24} className="mb-2" />
      <Skeleton width={200} height={14} className="mb-4" />
      <Skeleton height={60} />
    </div>
  );
}
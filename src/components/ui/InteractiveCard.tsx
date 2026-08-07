"use client";

interface InteractiveCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  lift?: boolean; // add translateY hover effect
  onClick?: () => void;
  className?: string;
}

export default function InteractiveCard({ children, style, lift = true, onClick, className }: InteractiveCardProps) {
  return (
    <div
      style={style}
      className={className}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (lift) {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--shd2)";
        }
      }}
      onMouseLeave={(e) => {
        if (lift) {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--shd)";
        }
      }}
    >
      {children}
    </div>
  );
}

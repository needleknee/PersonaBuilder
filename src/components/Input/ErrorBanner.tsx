type ErrorBannerProps = {
  message: string;
  onDismiss?: () => void;
};

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div role="alert" style={{ background: "#fdecea", color: "#b00020", padding: "0.75rem", margin: "0.5rem 0" }}>
      <p style={{ margin: 0 }}>{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}

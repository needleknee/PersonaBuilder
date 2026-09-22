type ValidationErrorProps = {
  message: string | null;
};

export default function ValidationError({ message }: ValidationErrorProps) {
  if (!message) return null;
  return (
    <p role="alert" style={{ color: "#b00020", margin: "0.5rem 0" }}>
      {message}
    </p>
  );
}

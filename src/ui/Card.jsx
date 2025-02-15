export function Card({ children }) {
  return (
    <div className="border border-green-400 p-4 rounded-md bg-black text-green-400">
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}

export function Button({ children, onClick }) {
  return (
    <button
      className="border border-green-400 text-green-400 bg-black p-2 rounded cursor-pointer"
      onClick={onClick}
      style={{
        fontFamily: "Courier New, monospace",
        textTransform: "uppercase",
        width: "100%",
        transition: "background 0.3s",
      }}
    >
      {children}
    </button>
  );
}

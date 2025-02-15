export function Input({ value, onChange, placeholder }) {
  return (
    <input
      className="bg-black text-green-400 border border-green-400 p-2 w-full font-mono focus:outline-none"
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{ textShadow: "0 0 5px #33ff33" }}
    />
  );
}

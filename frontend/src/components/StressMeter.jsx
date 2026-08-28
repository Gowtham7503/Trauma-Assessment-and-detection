export default function StressMeter({ value = 0 }) {
  return <progress value={value} max="100" />;
}


export default function NotFound() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", background: "#F3E9EB", color: "#33232A" }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 10px" }}>공개되지 않은 청첩장이에요</h1>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: "#6B5A60", margin: 0 }}>주소를 다시 확인해 주세요.<br />만든 분이 비공개로 바꾸었을 수도 있어요.</p>
      </div>
    </main>
  );
}

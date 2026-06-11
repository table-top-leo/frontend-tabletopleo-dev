"use client";

const TableTopLeoDashboardPage = () => {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#000000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Subtle floating background glows */}
      <div style={{
        position: "absolute",
        top: "30%",
        left: "20%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "floatSlow 25s ease-in-out infinite",
      }} />
      
      <div style={{
        position: "absolute",
        bottom: "25%",
        right: "15%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "floatSlow 30s ease-in-out infinite reverse",
      }} />

      <div style={{
        textAlign: "center",
        zIndex: 10,
      }}>
        <div style={{
          fontSize: "92px",
          fontWeight: "900",
          color: "#ffffff",
          letterSpacing: "-4px",
          lineHeight: "1",
          textShadow: "0 0 60px rgba(124,58,237,0.6)",
          animation: "floatText 6s ease-in-out infinite",
        }}>
          COMING SOON
        </div>
        
        <div style={{
          marginTop: "16px",
          fontSize: "18px",
          color: "#a1a1aa",
          letterSpacing: "6px",
          fontWeight: "500",
        }}>
          TABLETOP • LEO
        </div>
      </div>

      <style jsx>{`
        @keyframes floatText {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(40px, 30px); }
        }
      `}</style>
    </div>
  );
};

export default TableTopLeoDashboardPage;
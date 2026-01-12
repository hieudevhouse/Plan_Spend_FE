// app/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function Home() {
  const { isDarkMode } = useDarkMode();

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: isDarkMode
        ? "linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)"
        : "linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 40%, #c7d2fe 100%)",
      color: isDarkMode ? "#f1f5f9" : "#1e293b",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute",
        inset: 0,
        opacity: isDarkMode ? 0.2 : 0.4,
        background: isDarkMode
          ? "radial-gradient(circle at 30% 70%, #3b82f6 0%, transparent 40%), radial-gradient(circle at 70% 30%, #8b5cf6 0%, transparent 40%), radial-gradient(circle at 50% 50%, #ec4899 0%, transparent 30%)"
          : "radial-gradient(circle at 30% 70%, #6366f1 0%, transparent 40%), radial-gradient(circle at 70% 30%, #a78bfa 0%, transparent 40%), radial-gradient(circle at 50% 50%, #f472b6 0%, transparent 30%)",
        animation: "float 20s infinite ease-in-out",
        pointerEvents: "none",
      }} />

      {/* Nội dung chính */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "800px", width: "100%" }}>
        {/* Gấu bông - compact */}
        <div style={{
          marginBottom: "1rem",
          animation: "bearFloat 6s infinite ease-in-out",
        }}>
          <div style={{
            fontSize: "5rem",
            filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.3))",
            transform: "rotate(-10deg)",
            display: "inline-block",
          }}>
            🐻‍❄️
          </div>
        </div>

        {/* Tiêu đề chính - compact */}
        <h1 style={{
          fontSize: "3rem",
          fontWeight: 900,
          margin: "0 0 0.8rem",
          lineHeight: "1.1",
          background: isDarkMode
            ? "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6, #fbbf24)"
            : "linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899, #f59e0b)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          letterSpacing: "-0.03em",
        }}>
          Peak Planner
        </h1>

        <p style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          opacity: 0.95,
          margin: "0 auto 2rem",
          lineHeight: "1.5",
        }}>
          Người bạn gấu bông siêu anh hùng giúp bạn{' '}
          <span style={{ fontWeight: 800, color: isDarkMode ? "#fbbf24" : "#f59e0b" }}>
            chinh phục mọi mục tiêu
          </span>
        </p>

        {/* Features - compact grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1rem",
          margin: "2rem 0",
        }}>
          {[
            { icon: "📅✨", title: "Lịch thông minh", desc: "Lập kế hoạch ngày hoàn hảo" },
            { icon: "💰🔥", title: "Quản lý chi tiêu", desc: "Theo dõi tài chính rõ ràng" },
          ].map((feature, i) => (
            <div
              key={i}
              style={{
                background: isDarkMode ? 'rgba(51, 65, 85, 0.6)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(16px)',
                borderRadius: "20px",
                padding: "1.3rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)";
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.8rem" }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
                {feature.title}
              </h3>
              <p style={{ opacity: 0.85, fontSize: "0.9rem", lineHeight: "1.4", margin: 0 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button - compact */}
        <Link href="/login">
          <button style={{
            padding: "1rem 3rem",
            fontSize: "1.2rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b)",
            color: "white",
            border: "none",
            borderRadius: "9999px",
            cursor: "pointer",
            boxShadow: "0 20px 50px rgba(59, 130, 246, 0.5)",
            transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginTop: "1rem",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px) scale(1.05)";
              e.currentTarget.style.boxShadow = "0 30px 60px rgba(59, 130, 246, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 20px 50px rgba(59, 130, 246, 0.5)";
            }}
          >
            <span style={{ fontSize: "1.6rem", animation: "bounce 2s infinite" }}>🚀</span>
            Bắt đầu hành trình  
            <span style={{ fontSize: "1.6rem", animation: "bounce 2s infinite 0.5s" }}>✨</span>
          </button>
        </Link>

        {/* Footer - compact */}
        <div style={{
          marginTop: "2rem",
          fontSize: "0.85rem",
          opacity: 0.7,
        }}>
          © 2025 Peak Planner • Đồng hành cùng bạn 🐻‍❄️💫
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes bearFloat {
          0%, 100% { transform: translateY(0) rotate(-10deg); }
          50% { transform: translateY(-20px) rotate(-5deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(15px); }
          100% { transform: translateY(0) translateX(0); }
        }
      `}</style>
    </div>
  );
}
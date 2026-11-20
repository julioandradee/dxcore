import React, { useEffect, useState } from 'react'

export interface CaptureAnimationProps {
  /** Callback disparado quando a animação de 2 segundos é concluída */
  onComplete?: () => void
  /** Se deve repetir automaticamente em loop para visualização */
  loop?: boolean
  /** Exibir botão para reiniciar a animação na tela de prévia */
  showControls?: boolean
  /** Tamanho da Pokébola em pixels (padrão: 100) */
  size?: number
}

/**
 * Componente de Animação de Captura Pokémon (Duração: 2s)
 * - Reproduz as 3 oscilações clássicas da Pokébola com LED pulsante
 * - Dispara brilho/estrelas de captura com sucesso aos 1.6s
 * - Exibe a marca DXCore estilizada logo abaixo
 */
export const CaptureAnimation: React.FC<CaptureAnimationProps> = ({
  onComplete,
  loop = false,
  showControls = false,
  size = 110,
}) => {
  const [animKey, setAnimKey] = useState(0)

  const handleReplay = () => {
    setAnimKey((prev) => prev + 1)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete()
      if (loop) setAnimKey((prev) => prev + 1)
    }, 2100)

    return () => clearTimeout(timer)
  }, [animKey, loop, onComplete])

  return (
    <div
      key={animKey}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes pokeballCapture {
          0% {
            transform: translateY(-20px) scale(0.92);
            filter: drop-shadow(0 15px 12px rgba(0,0,0,0.3));
          }
          10% {
            transform: translateY(0) scale(1.05, 0.9);
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
          }
          16% {
            transform: translateY(-6px) scale(0.98, 1.02);
          }
          22% {
            transform: translateY(0) scale(1);
          }
          /* 1º balanço para a esquerda */
          30% {
            transform: rotate(-24deg) translateX(-6px);
          }
          40% {
            transform: rotate(0deg) translateX(0);
          }
          /* 2º balanço para a direita */
          52% {
            transform: rotate(24deg) translateX(6px);
          }
          62% {
            transform: rotate(0deg) translateX(0);
          }
          /* 3º balanço para a esquerda */
          72% {
            transform: rotate(-18deg) translateX(-4px);
          }
          82% {
            transform: rotate(0deg) translateX(0);
          }
          /* Clique de captura final aos ~85% (1.7s) */
          86% {
            transform: scale(0.96);
          }
          90% {
            transform: scale(1.04);
            filter: drop-shadow(0 0 16px rgba(56, 189, 248, 0.8));
          }
          100% {
            transform: scale(1);
            filter: drop-shadow(0 6px 12px rgba(0,0,0,0.35));
          }
        }

        @keyframes ledBlink {
          0%, 15% {
            background-color: #e2e8f0;
            box-shadow: inset 0 0 4px rgba(0,0,0,0.3);
          }
          /* Pisca vermelho forte durante as tentativas */
          25%, 35% {
            background-color: #ef4444;
            box-shadow: 0 0 12px #ef4444, inset 0 0 3px #ffffff;
          }
          42%, 48% {
            background-color: #cbd5e1;
            box-shadow: inset 0 0 3px rgba(0,0,0,0.2);
          }
          50%, 60% {
            background-color: #ef4444;
            box-shadow: 0 0 12px #ef4444, inset 0 0 3px #ffffff;
          }
          68%, 70% {
            background-color: #cbd5e1;
            box-shadow: inset 0 0 3px rgba(0,0,0,0.2);
          }
          72%, 82% {
            background-color: #ef4444;
            box-shadow: 0 0 12px #ef4444, inset 0 0 3px #ffffff;
          }
          /* Sucesso da captura: trava no azul ciano DXCore */
          85% {
            background-color: #38bdf8;
            box-shadow: 0 0 18px #38bdf8, 0 0 30px #38bdf8, inset 0 0 4px #ffffff;
          }
          100% {
            background-color: #38bdf8;
            box-shadow: 0 0 10px #38bdf8, inset 0 0 3px #ffffff;
          }
        }

        @keyframes starsBurst {
          0%, 82% {
            opacity: 0;
            transform: scale(0.3) rotate(0deg);
          }
          86% {
            opacity: 1;
            transform: scale(1.1) rotate(20deg);
          }
          100% {
            opacity: 0.85;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes dxcoreReveal {
          0%, 40% {
            opacity: 0;
            transform: translateY(12px) scale(0.95);
            letter-spacing: 1px;
          }
          75% {
            opacity: 0.7;
            transform: translateY(2px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            letter-spacing: 2px;
          }
        }

        @keyframes ringShockwave {
          0%, 84% {
            opacity: 0;
            transform: scale(0.5);
          }
          86% {
            opacity: 0.8;
            transform: scale(0.8);
          }
          100% {
            opacity: 0;
            transform: scale(1.6);
          }
        }
      `}</style>

      {/* Contêiner da Pokébola com onda de choque e estrelas */}
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Onda de choque emitida no momento do clique (1.7s) */}
        <div
          style={{
            position: 'absolute',
            width: size * 1.1,
            height: size * 1.1,
            borderRadius: '50%',
            border: '3px solid #38bdf8',
            pointerEvents: 'none',
            animation: 'ringShockwave 2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
          }}
        />

        {/* Estrelas / partículas de captura */}
        <div
          style={{
            position: 'absolute',
            top: -16,
            left: -16,
            right: -16,
            bottom: -16,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'starsBurst 2s ease-out forwards',
          }}
        >
          <span style={{ position: 'absolute', top: 4, left: 10, fontSize: 18, color: '#facc15' }}>✨</span>
          <span style={{ position: 'absolute', top: 6, right: 12, fontSize: 16, color: '#38bdf8' }}>★</span>
          <span style={{ position: 'absolute', bottom: 12, left: 8, fontSize: 14, color: '#38bdf8' }}>✦</span>
          <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 17, color: '#facc15' }}>✨</span>
        </div>

        {/* A Pokébola animada */}
        <div
          style={{
            position: 'relative',
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #ea3838 0%, #dc2626 48%, #1e293b 48%, #1e293b 52%, #ffffff 52%, #e2e8f0 100%)',
            border: '4px solid #1e293b',
            boxSizing: 'border-box',
            transformOrigin: '50% 90%',
            animation: 'pokeballCapture 2s cubic-bezier(0.3, 0.1, 0.3, 1) forwards',
            overflow: 'hidden',
          }}
        >
          {/* Brilho de reflexo de luz na parte superior */}
          <div
            style={{
              position: 'absolute',
              top: '6%',
              left: '12%',
              width: '40%',
              height: '24%',
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 80%)',
              transform: 'rotate(-20deg)',
              pointerEvents: 'none',
            }}
          />

          {/* Faixa central preta */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 10,
              backgroundColor: '#1e293b',
              transform: 'translateY(-50%)',
            }}
          />

          {/* Anel externo do botão central */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: size * 0.32,
              height: size * 0.32,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              backgroundColor: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            }}
          >
            {/* Anel interno branco */}
            <div
              style={{
                width: '74%',
                height: '74%',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '2px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Botão LED pulsante */}
              <div
                style={{
                  width: '56%',
                  height: '56%',
                  borderRadius: '50%',
                  border: '1.5px solid #64748b',
                  animation: 'ledBlink 2s ease-in-out forwards',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tipografia DXCore com esfera azul padrão */}
      <div
        style={{
          marginTop: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          animation: 'dxcoreReveal 2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: '#38bdf8',
            boxShadow: '0 0 10px #38bdf8, inset 0 0 4px #ffffff',
            border: '2px solid #ffffff',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 2,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            color: '#f8fafc',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          DXCore
        </span>
      </div>

      {/* Controles para teste/reprodução */}
      {showControls && (
        <button
          type="button"
          onClick={handleReplay}
          style={{
            marginTop: 20,
            padding: '6px 16px',
            backgroundColor: '#38bdf8',
            color: '#001529',
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(56, 189, 248, 0.35)',
            transition: 'transform 0.15s ease, background-color 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ↻ Repetir Animação (2s)
        </button>
      )}
    </div>
  )
}

export default CaptureAnimation

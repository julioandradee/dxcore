import React, { useEffect, useState } from 'react'
import { theme } from 'antd'

export interface CaptureAnimationProps {
  /** Callback disparado quando a animação de introdução é concluída */
  onComplete?: () => void
  /** Se deve repetir automaticamente em loop para visualização */
  loop?: boolean
  /** Exibir botão para reiniciar a animação na tela de prévia */
  showControls?: boolean
  /** Tamanho do ícone em pixels (padrão: 150) */
  size?: number
  /** Cor personalizada do texto do nome do app (padrão: cor do texto do tema) */
  textColor?: string
  /** Estilos inline opcionais para o contêiner raiz */
  style?: React.CSSProperties
  /** Se true, renderiza diretamente no estado final estável sem temporizadores */
  staticFinal?: boolean
}

/**
 * Componente de Animação de Abertura DXCore (Save Moderno com Órbita Sincronizada a 120°)
 * - Ícone central minimalista em vermelho Pokédex (#DC0A2D) com LED azul pulsante
 * - Linha de órbita pontilhada fina com micropontos arredondados
 * - 3 elementos em órbita perfeitamente travados em 120° (Pokébola, Ícone Shiny e Insígnia)
 * - Efeitos estabelecidos de fade-in e fade-up
 * - Tipografia oficial DXCore com esfera azul
 */
export const CaptureAnimation: React.FC<CaptureAnimationProps> = ({
  onComplete,
  loop = false,
  showControls = false,
  size = 150,
  textColor,
  style,
  staticFinal = false,
}) => {
  const [animKey, setAnimKey] = useState(0)
  const { token } = theme.useToken()

  const handleReplay = () => {
    setAnimKey((prev) => prev + 1)
  }

  useEffect(() => {
    if (staticFinal) return
    const timer = setTimeout(() => {
      if (onComplete) onComplete()
      if (loop) setAnimKey((prev) => prev + 1)
    }, 2400)

    return () => clearTimeout(timer)
  }, [animKey, loop, onComplete, staticFinal])

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
        ...style,
      }}
    >
      <style>{`
        /* Fade-up suave na entrada do ícone Save */
        @keyframes saveFadeUp {
          0% {
            opacity: 0;
            transform: translateY(16px) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }

        /* Flutuação suave contínua do Save central */
        @keyframes floatSave {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        /* Pulsação do LED indicador azul */
        @keyframes pulseLed {
          0%, 100% {
            opacity: 0.95;
            transform: scale(1);
          }
          50% {
            opacity: 0.35;
            transform: scale(0.8);
          }
        }

        /* Rotação Rígida Sincronizada a 120° com aceleração e desaceleração dinâmicas */
        /* Os 3 itens NUNCA se aproximam: a distância angular entre eles é 120° exatos */
        @keyframes orbitRotate {
          0% {
            transform: rotate(0deg);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.2, 0.95);
          }
          33.333% {
            transform: rotate(120deg);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.2, 0.95);
          }
          66.666% {
            transform: rotate(240deg);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.2, 0.95);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Contrarrotação idêntica para manter Pokébola, Shiny e Insígnia sempre em pé */
        @keyframes orbitCounter {
          0% {
            transform: rotate(0deg);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.2, 0.95);
          }
          33.333% {
            transform: rotate(-120deg);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.2, 0.95);
          }
          66.666% {
            transform: rotate(-240deg);
            animation-timing-function: cubic-bezier(0.7, 0.05, 0.2, 0.95);
          }
          100% {
            transform: rotate(-360deg);
          }
        }

        /* Cintilação do Ícone Shiny */
        @keyframes twinkleShiny {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.15) rotate(18deg);
          }
        }

        /* Balanço da Insígnia */
        @keyframes wobbleBadge {
          0%, 100% {
            transform: rotate(-7deg);
          }
          50% {
            transform: rotate(7deg);
          }
        }

        /* Balanço da Pokébola */
        @keyframes wobblePoke {
          0%, 100% {
            transform: rotate(-10deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }

        /* Pulsação do anel pontilhado de órbita */
        @keyframes breatheRing {
          0%, 100% {
            opacity: 0.65;
          }
          50% {
            opacity: 0.95;
          }
        }

        /* Fade-up de revelação do título DXCore */
        @keyframes dxcoreReveal {
          0%, 35% {
            opacity: 0;
            transform: translateY(14px) scale(0.95);
            letter-spacing: 1px;
          }
          75% {
            opacity: 0.75;
            transform: translateY(2px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            letter-spacing: 2px;
          }
        }
      `}</style>

      {/* Contêiner com animação fade-up inicial */}
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: staticFinal ? 'none' : 'saveFadeUp 0.65s cubic-bezier(0.2, 0.8, 0.3, 1) forwards',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="60 60 280 280"
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Filtros de Glow Neon e Sombras */}
            <filter id="splashGlowRed" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="splashGlowCyan" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="splashGlowGold" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="splashShadowRed" x="-25%" y="-25%" width="150%" height="150%">
              {/* <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.65" /> */}
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#DC0A2D" floodOpacity="0.25" />
            </filter>

            <filter id="splashItemShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
            </filter>

            {/* Gradientes Vermelho DXCore Pokédex */}
            <linearGradient id="splashDiskRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b0b13" />
              <stop offset="50%" stopColor="#24060b" />
              <stop offset="100%" stopColor="#120205" />
            </linearGradient>

            <linearGradient id="splashDiskRimRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d6d" />
              <stop offset="40%" stopColor="#DC0A2D" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>

            <linearGradient id="splashShutterMetal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="splashLabelRedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#180407" />
              <stop offset="100%" stopColor="#2c070f" />
            </linearGradient>

            <linearGradient id="splashAccentRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff4d6d" />
              <stop offset="100%" stopColor="#DC0A2D" />
            </linearGradient>

            <linearGradient id="splashPokeRed" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#DC0A2D" />
            </linearGradient>

            <linearGradient id="splashPokeWhite" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            <linearGradient id="splashGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* <radialGradient id="splashHaloCenter" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#DC0A2D" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#991b1b" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient> */}
          </defs>

          {/* Halo Central Sutil Vermelho */}
          <circle cx="200" cy="200" r="130" fill="url(#splashHaloCenter)" />

          {/* Anel de Órbita Pontilhada com Micropontos Circulares (R=110px) */}
          <g style={{ animation: staticFinal ? 'none' : 'breatheRing 4s ease-in-out infinite' }}>
            <circle
              cx="200"
              cy="200"
              r="110"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeDasharray="1 10"
              filter="url(#splashGlowRed)"
            />
            <circle
              cx="200"
              cy="200"
              r="110"
              fill="none"
              stroke="#11b2ca"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="1 10"
              opacity="0.75"
            />
          </g>

          {/* Ícone Central de Save Vermelho Pokédex (Sem Círculos) */}
          <g
            filter="url(#splashShadowRed)"
            style={{
              animation: staticFinal ? 'none' : 'floatSave 4s ease-in-out infinite',
              transformOrigin: '200px 200px',
            }}
          >
            {/* Corpo Principal com chanfro no canto superior direito */}
            <path
              d="M 148,136 L 236,136 L 258,158 L 258,252 A 12,12 0 0 1 246,264 L 154,264 A 12,12 0 0 1 142,252 L 142,148 A 12,12 0 0 1 148,136 Z"
              fill="url(#splashDiskRed)"
              stroke="url(#splashDiskRimRed)"
              strokeWidth="3"
            />

            {/* Shutter Metálico Superior */}
            <rect x="162" y="136" width="66" height="42" rx="4" fill="url(#splashShutterMetal)" stroke="#1a0407" strokeWidth="1.5" />
            <rect x="174" y="144" width="16" height="26" rx="2.5" fill="#180407" />

            {/* Área de Cartão Central Minimalista */}
            <rect x="154" y="190" width="92" height="62" rx="6" fill="url(#splashLabelRedGrad)" stroke="#DC0A2D" strokeWidth="1.5" />
            <rect x="162" y="198" width="76" height="4" rx="2" fill="url(#splashAccentRed)" />
            {/* Janela Interna Limpa (sem círculos) */}
            <rect x="170" y="212" width="60" height="26" rx="4" fill="#0d0204" stroke="#4c0d17" strokeWidth="1" />

            {/* LED Azul Indicador de Escrita */}
            <g transform="translate(238, 244)">
              <circle
                cx="0"
                cy="0"
                r="3.2"
                fill="#22d3ee"
                filter="url(#splashGlowCyan)"
                style={{
                  animation: staticFinal ? 'none' : 'pulseLed 2s ease-in-out infinite',
                }}
              />
              <circle cx="-0.6" cy="-0.6" r="1" fill="#ffffff" />
            </g>
          </g>

          {/* 3 Elementos em Órbita Rígida Sincronizada a 120° (Nunca se aproximam) */}
          <g
            style={{
              animation: staticFinal ? 'none' : 'orbitRotate 5.4s infinite',
              transformOrigin: '200px 200px',
            }}
          >
            {/* 1. Pokébola (0°, Superior: 200, 90) */}
            <g transform="translate(200, 90)">
              <g
                filter="url(#splashItemShadow)"
                style={{
                  animation: staticFinal ? 'none' : 'orbitCounter 5.4s infinite',
                  transformOrigin: '0px 0px',
                }}
              >
                <g style={{ animation: staticFinal ? 'none' : 'wobblePoke 4.5s ease-in-out infinite', transformOrigin: '0 0' }}>
                  <path d="M -15,0 A 15 15 0 0 1 15,0 Z" fill="url(#splashPokeRed)" stroke="#1a0407" strokeWidth="2" />
                  <path d="M -9,-7 Q -2,-12 7,-6 Q 0,-9 -7,-5 Z" fill="#ffffff" opacity="0.65" />
                  <path d="M -15,0 A 15 15 0 0 0 15,0 Z" fill="url(#splashPokeWhite)" stroke="#1a0407" strokeWidth="2" />
                  <rect x="-15" y="-2" width="30" height="4" fill="#1a0407" />
                  <circle cx="0" cy="0" r="5" fill="#1a0407" />
                  <circle cx="0" cy="0" r="3.4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                  <circle cx="0" cy="0" r="1.6" fill="#22d3ee" filter="url(#splashGlowCyan)" />
                </g>
              </g>
            </g>

            {/* 2. Ícone Shiny (120°, Inferior Direito: 295.26, 255) */}
            <g transform="translate(295.26, 255)">
              <g
                style={{
                  animation: staticFinal ? 'none' : 'orbitCounter 5.4s infinite',
                  transformOrigin: '0px 0px',
                }}
              >
                <g
                  filter="url(#splashGlowGold)"
                  style={{ animation: staticFinal ? 'none' : 'twinkleShiny 2.5s ease-in-out infinite', transformOrigin: '0 0' }}
                >
                  <circle cx="0" cy="0" r="13" fill="#fef08a" opacity="0.25" />
                  <path
                    d="M 0,-16 Q 0,0 -16,0 Q 0,0 0,16 Q 0,0 16,0 Q 0,0 0,-16 Z"
                    fill="url(#splashGoldGrad)"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  <circle cx="0" cy="0" r="2.8" fill="#ffffff" />
                  <g transform="translate(9, -9) scale(0.38)">
                    <path d="M 0,-14 Q 0,0 -14,0 Q 0,0 0,14 Q 0,0 14,0 Q 0,0 0,-14 Z" fill="#ffffff" />
                  </g>
                  <g transform="translate(-8, 8) scale(0.3)">
                    <path d="M 0,-14 Q 0,0 -14,0 Q 0,0 0,14 Q 0,0 14,0 Q 0,0 0,-14 Z" fill="#fde047" />
                  </g>
                </g>
              </g>
            </g>

            {/* 3. Insígnia de Ginásio (240°, Inferior Esquerdo: 104.74, 255) */}
            <g transform="translate(104.74, 255)">
              <g
                filter="url(#splashItemShadow)"
                style={{
                  animation: staticFinal ? 'none' : 'orbitCounter 5.4s infinite',
                  transformOrigin: '0px 0px',
                }}
              >
                <g style={{ animation: staticFinal ? 'none' : 'wobbleBadge 3.6s ease-in-out infinite', transformOrigin: '0 0' }}>
                  <path
                    d="M 0,-16 L 13,-6 L 10,10 L 0,16 L -10,10 L -13,-6 Z"
                    fill="url(#splashGoldGrad)"
                    stroke="#fef08a"
                    strokeWidth="1.4"
                  />
                  <path d="M 0,-14 L -11,-5 L 0,0 Z" fill="#38bdf8" />
                  <path d="M 0,-14 L 11,-5 L 0,0 Z" fill="#DC0A2D" />
                  <path d="M 11,-5 L 8,8 L 0,0 Z" fill="#f59e0b" />
                  <path d="M 8,8 L 0,14 L 0,0 Z" fill="#6366f1" />
                  <path d="M 0,14 L -8,8 L 0,0 Z" fill="#22d3ee" />
                  <path d="M -8,8 L -11,-5 L 0,0 Z" fill="#0ea5e9" />
                  <path d="M 0,-14 L 0,14 M -11,-5 L 11,-5 M -8,8 L 8,8" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
                  <circle cx="-3" cy="-5" r="1.5" fill="#ffffff" opacity="0.9" />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Tipografia DXCore com esfera azul padrão e animação fade-up */}
      <div
        style={{
          marginTop: 10,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          animation: staticFinal ? 'none' : 'dxcoreReveal 2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards',
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
            color: textColor || token.colorText,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
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
            marginTop: 16,
            padding: '6px 16px',
            backgroundColor: '#DC0A2D',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 13,
            borderRadius: 20,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(220, 10, 45, 0.4)',
            transition: 'transform 0.15s ease, background-color 0.15s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.96)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ↻ Repetir Animação
        </button>
      )}
    </div>
  )
}

export default CaptureAnimation

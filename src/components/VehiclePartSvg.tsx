import React from 'react';
import { PuzzlePiece } from '../types/vehicle';

interface Props {
  piece: PuzzlePiece;
  isGhost?: boolean;
  isCompleted?: boolean;
  isInteractive?: boolean;
  interactiveState?: {
    boomAngle?: number;
    armAngle?: number;
    bucketAngle?: number;
    dumpAngle?: number;
    bladeLift?: number;
    sirenActive?: boolean;
    ladderAngle?: number;
    ladderExtend?: number;
    headlightsOn?: boolean;
  };
}

export const VehiclePartSvg: React.FC<Props> = ({
  piece,
  isGhost = false,
  interactiveState = {},
}) => {
  const {
    boomAngle = 0,
    armAngle = 0,
    bucketAngle = 0,
    dumpAngle = 0,
    bladeLift = 0,
    sirenActive = false,
    ladderAngle = 0,
    ladderExtend = 0,
    headlightsOn = false,
  } = interactiveState;

  // If ghost / outline mode for puzzle backdrop
  const fill = isGhost ? 'rgba(15, 23, 42, 0.08)' : piece.color;
  const stroke = isGhost ? '#64748B' : '#0F172A';
  const strokeWidth = isGhost ? 2.5 : 2;
  const strokeDash = isGhost ? '6 4' : 'none';

  switch (piece.svgPath) {
    // ==================== EXCAVATOR ====================
    case 'tracks':
      return (
        <g id={piece.id}>
          {/* Main Track Frame */}
          <rect
            x={piece.x}
            y={piece.y + 10}
            width={piece.width}
            height={piece.height - 20}
            rx={32}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Internal steel plate */}
              <rect
                x={piece.x + 25}
                y={piece.y + 25}
                width={piece.width - 50}
                height={piece.height - 50}
                rx={18}
                fill="#334155"
              />
              {/* Rollers / Idler wheels */}
              {[40, 100, 160, 220, 280].map((rx, idx) => (
                <g key={idx} transform={`translate(${piece.x + rx}, ${piece.y + 55})`}>
                  <circle r={22} fill="#64748B" stroke="#0F172A" strokeWidth="2" />
                  <circle r={10} fill="#94A3B8" />
                  <circle r={4} fill="#0F172A" />
                </g>
              ))}
              {/* Track treads (grippers) */}
              {Array.from({ length: 18 }).map((_, i) => (
                <rect
                  key={i}
                  x={piece.x + 15 + i * 16}
                  y={piece.y + 8}
                  width={6}
                  height={8}
                  rx={2}
                  fill="#0F172A"
                />
              ))}
              {Array.from({ length: 18 }).map((_, i) => (
                <rect
                  key={`b-${i}`}
                  x={piece.x + 15 + i * 16}
                  y={piece.y + piece.height - 18}
                  width={6}
                  height={8}
                  rx={2}
                  fill="#0F172A"
                />
              ))}
            </>
          )}
        </g>
      );

    case 'swing_deck':
      return (
        <g id={piece.id}>
          <path
            d={`M ${piece.x} ${piece.y + 40} L ${piece.x + 20} ${piece.y + 10} L ${piece.x + piece.width - 20} ${piece.y + 10} L ${piece.x + piece.width} ${piece.y + 40} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Slew ring gear teeth details */}
              <rect x={piece.x + 30} y={piece.y + 36} width={piece.width - 60} height={12} fill="#1E293B" rx={4} />
              <line x1={piece.x + 15} y1={piece.y + 24} x2={piece.x + piece.width - 15} y2={piece.y + 24} stroke="#CA8A04" strokeWidth="3" />
            </>
          )}
        </g>
      );

    case 'counterweight':
      return (
        <g id={piece.id}>
          <path
            d={`M ${piece.x + 15} ${piece.y} C ${piece.x} ${piece.y + 30}, ${piece.x} ${piece.y + 70}, ${piece.x + 20} ${piece.y + piece.height} L ${piece.x + piece.width} ${piece.y + piece.height} L ${piece.x + piece.width} ${piece.y} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Construction warning chevrons */}
              <g transform={`translate(${piece.x + 15}, ${piece.y + 45})`}>
                <rect width={piece.width - 25} height={18} fill="#FACC15" rx={2} />
                <path d="M 5 0 L 15 18 M 25 0 L 35 18 M 45 0 L 55 18 M 65 0 L 75 18" stroke="#1E293B" strokeWidth="4" />
              </g>
              <circle cx={piece.x + piece.width - 25} cy={piece.y + 25} r={7} fill="#1E293B" />
            </>
          )}
        </g>
      );

    case 'engine_hood':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={12}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Air vents / cooling louvers */}
              {[15, 30, 45, 60, 75].map((vy, i) => (
                <rect key={i} x={piece.x + 20} y={piece.y + vy} width={piece.width - 40} height={5} rx={2} fill="#475569" />
              ))}
              <rect x={piece.x + 10} y={piece.y + piece.height - 14} width={piece.width - 20} height={5} fill="#CA8A04" />
            </>
          )}
        </g>
      );

    case 'cabin':
      return (
        <g id={piece.id}>
          {/* Cabin outer shell */}
          <path
            d={`M ${piece.x} ${piece.y + piece.height} L ${piece.x} ${piece.y + 30} L ${piece.x + 40} ${piece.y} L ${piece.x + piece.width} ${piece.y} L ${piece.x + piece.width} ${piece.y + piece.height} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Safety Glass Tinted Window */}
              <path
                d={`M ${piece.x + 10} ${piece.y + piece.height - 20} L ${piece.x + 10} ${piece.y + 38} L ${piece.x + 42} ${piece.y + 12} L ${piece.x + piece.width - 12} ${piece.y + 12} L ${piece.x + piece.width - 12} ${piece.y + piece.height - 20} Z`}
                fill="#38BDF8"
                opacity="0.85"
                stroke="#0284C7"
                strokeWidth="2"
              />
              {/* Glass reflection highlight */}
              <path
                d={`M ${piece.x + 22} ${piece.y + 45} L ${piece.x + 48} ${piece.y + 18} L ${piece.x + 65} ${piece.y + 18} L ${piece.x + 35} ${piece.y + 55} Z`}
                fill="#FFFFFF"
                opacity="0.6"
              />
              {/* Operator seat & steering levers */}
              <rect x={piece.x + 25} y={piece.y + 80} width={28} height={40} rx={4} fill="#1E293B" />
              <line x1={piece.x + 60} y1={piece.y + 100} x2={piece.x + 70} y2={piece.y + 85} stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
              <circle cx={piece.x + 70} cy={piece.y + 85} r={4} fill="#EF4444" />
              {/* Outer grab handle */}
              <line x1={piece.x + piece.width - 8} y1={piece.y + 50} x2={piece.x + piece.width - 8} y2={piece.y + 100} stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
            </>
          )}
        </g>
      );

    case 'cylinder':
      return (
        <g id={piece.id} transform={`rotate(${boomAngle * 0.4}, ${piece.x}, ${piece.y + 40})`}>
          <rect
            x={piece.x}
            y={piece.y + 15}
            width={piece.width - 30}
            height={28}
            rx={10}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Chrome piston rod */}
              <rect x={piece.x + piece.width - 40} y={piece.y + 20} width={38} height={18} rx={4} fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
              {/* Cylinder pivot joints */}
              <circle cx={piece.x + 12} cy={piece.y + 29} r={7} fill="#475569" stroke="#0F172A" strokeWidth="2" />
              <circle cx={piece.x + piece.width - 5} cy={piece.y + 29} r={7} fill="#475569" stroke="#0F172A" strokeWidth="2" />
            </>
          )}
        </g>
      );

    case 'boom':
      return (
        <g
          id={piece.id}
          transform={`rotate(${boomAngle}, ${piece.x + 20}, ${piece.y + piece.height - 20})`}
          style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {/* Curved Heavy Industrial Boom Arm */}
          <path
            d={`M ${piece.x + 10} ${piece.y + piece.height - 10} 
               L ${piece.x + 40} ${piece.y + 30} 
               L ${piece.x + piece.width - 20} ${piece.y + 10} 
               L ${piece.x + piece.width} ${piece.y + 40} 
               L ${piece.x + 80} ${piece.y + piece.height - 10} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Reinforcing rib lines */}
              <path
                d={`M ${piece.x + 28} ${piece.y + piece.height - 20} L ${piece.x + 48} ${piece.y + 40} L ${piece.x + piece.width - 25} ${piece.y + 25}`}
                stroke="#CA8A04"
                strokeWidth="4"
                fill="none"
              />
              {/* Heavy hinge pin pivot */}
              <circle cx={piece.x + 25} cy={piece.y + piece.height - 20} r={10} fill="#1E293B" stroke="#FACC15" strokeWidth="3" />
              <circle cx={piece.x + piece.width - 15} cy={piece.y + 25} r={9} fill="#1E293B" stroke="#FACC15" strokeWidth="3" />
            </>
          )}
        </g>
      );

    case 'arm':
      return (
        <g
          id={piece.id}
          transform={`rotate(${armAngle}, ${piece.x + 20}, ${piece.y + 20})`}
          style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <path
            d={`M ${piece.x + 10} ${piece.y + 10} L ${piece.x + 50} ${piece.y + 10} L ${piece.x + piece.width - 10} ${piece.y + piece.height - 10} L ${piece.x + piece.width - 45} ${piece.y + piece.height - 5} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Arm cylinder and hydraulic piping */}
              <line x1={piece.x + 30} y1={piece.y + 20} x2={piece.x + piece.width - 25} y2={piece.y + piece.height - 25} stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
              <circle cx={piece.x + 25} cy={piece.y + 20} r={9} fill="#334155" stroke="#E2E8F0" strokeWidth="2" />
              <circle cx={piece.x + piece.width - 25} cy={piece.y + piece.height - 15} r={9} fill="#334155" stroke="#E2E8F0" strokeWidth="2" />
            </>
          )}
        </g>
      );

    case 'bucket':
      return (
        <g
          id={piece.id}
          transform={`rotate(${bucketAngle}, ${piece.x + 25}, ${piece.y + 25})`}
          style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {/* Toothed Heavy Excavator Bucket */}
          <path
            d={`M ${piece.x + 20} ${piece.y + 10} 
               L ${piece.x + 80} ${piece.y + 20} 
               C ${piece.x + 110} ${piece.y + 50}, ${piece.x + 110} ${piece.y + 90}, ${piece.x + 70} ${piece.y + 110} 
               L ${piece.x + 10} ${piece.y + 80} 
               L ${piece.x + 15} ${piece.y + 40} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* 4 Sharp Digging Teeth */}
              {[0, 18, 36, 54].map((offset, i) => (
                <path
                  key={i}
                  d={`M ${piece.x + 10 + offset} ${piece.y + 80 + offset * 0.4} L ${piece.x - 2 + offset} ${piece.y + 95 + offset * 0.4} L ${piece.x + 16 + offset} ${piece.y + 85 + offset * 0.4} Z`}
                  fill="#F59E0B"
                  stroke="#78350F"
                  strokeWidth="1.5"
                />
              ))}
              <circle cx={piece.x + 35} cy={piece.y + 25} r={8} fill="#94A3B8" stroke="#0F172A" strokeWidth="2" />
              <circle cx={piece.x + 65} cy={piece.y + 35} r={8} fill="#94A3B8" stroke="#0F172A" strokeWidth="2" />
            </>
          )}
        </g>
      );

    case 'beacon_exhaust':
      return (
        <g id={piece.id}>
          {/* Vertical Exhaust Stack */}
          <rect
            x={piece.x + 10}
            y={piece.y + 10}
            width={12}
            height={piece.height - 10}
            rx={4}
            fill={isGhost ? fill : '#475569'}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              <path d={`M ${piece.x + 8} ${piece.y + 10} L ${piece.x + 24} ${piece.y + 4} L ${piece.x + 24} ${piece.y + 14} Z`} fill="#334155" />
              {/* Flashing Amber Beacon */}
              <circle cx={piece.x + 40} cy={piece.y + 25} r={14} fill={sirenActive ? '#F59E0B' : '#D97706'} stroke="#78350F" strokeWidth="2" className={sirenActive ? 'animate-pulse' : ''} />
              <rect x={piece.x + 32} y={piece.y + 35} width={16} height={8} fill="#1E293B" rx={2} />
              {sirenActive && (
                <circle cx={piece.x + 40} cy={piece.y + 25} r={22} fill="rgba(245, 158, 11, 0.4)" />
              )}
            </>
          )}
        </g>
      );

    // ==================== DUMP TRUCK ====================
    case 'dt_chassis':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={8}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              <line x1={piece.x + 20} y1={piece.y + 25} x2={piece.x + piece.width - 20} y2={piece.y + 25} stroke="#1E293B" strokeWidth="6" />
              {/* Battery box & air tanks */}
              <rect x={piece.x + 260} y={piece.y + 15} width={45} height={25} rx={4} fill="#475569" stroke="#0F172A" strokeWidth="2" />
            </>
          )}
        </g>
      );

    case 'wheel':
      return (
        <g id={piece.id}>
          <circle
            cx={piece.x + piece.width / 2}
            cy={piece.y + piece.height / 2}
            r={piece.width / 2 - 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Deep knobby tire treads */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 360) / 12;
                return (
                  <line
                    key={i}
                    x1={piece.x + piece.width / 2}
                    y1={piece.y + 4}
                    x2={piece.x + piece.width / 2}
                    y2={piece.y + 14}
                    stroke="#0F172A"
                    strokeWidth="4"
                    transform={`rotate(${angle}, ${piece.x + piece.width / 2}, ${piece.y + piece.height / 2})`}
                  />
                );
              })}
              {/* Silver alloy rim */}
              <circle cx={piece.x + piece.width / 2} cy={piece.y + piece.height / 2} r={piece.width * 0.28} fill="#CBD5E1" stroke="#475569" strokeWidth="3" />
              {/* Lug nuts */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (i * 360) / 6;
                return (
                  <circle
                    key={`lug-${i}`}
                    cx={piece.x + piece.width / 2}
                    cy={piece.y + piece.height / 2 - piece.width * 0.16}
                    r={3}
                    fill="#1E293B"
                    transform={`rotate(${angle}, ${piece.x + piece.width / 2}, ${piece.y + piece.height / 2})`}
                  />
                );
              })}
              <circle cx={piece.x + piece.width / 2} cy={piece.y + piece.height / 2} r={7} fill="#475569" />
            </>
          )}
        </g>
      );

    case 'dt_rear_wheels':
      return (
        <g id={piece.id}>
          {/* Dual Tandem Wheels */}
          <g>
            <circle
              cx={piece.x + 45}
              cy={piece.y + 50}
              r={44}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDash}
            />
            {!isGhost && (
              <>
                <circle cx={piece.x + 45} cy={piece.y + 50} r={24} fill="#CBD5E1" stroke="#475569" strokeWidth="3" />
                <circle cx={piece.x + 45} cy={piece.y + 50} r={7} fill="#1E293B" />
              </>
            )}
          </g>
          <g>
            <circle
              cx={piece.x + 140}
              cy={piece.y + 50}
              r={44}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDash}
            />
            {!isGhost && (
              <>
                <circle cx={piece.x + 140} cy={piece.y + 50} r={24} fill="#CBD5E1" stroke="#475569" strokeWidth="3" />
                <circle cx={piece.x + 140} cy={piece.y + 50} r={7} fill="#1E293B" />
              </>
            )}
          </g>
        </g>
      );

    case 'dt_fuel_tank':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={16}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Stainless steel bands */}
              <line x1={piece.x + 20} y1={piece.y} x2={piece.x + 20} y2={piece.y + piece.height} stroke="#334155" strokeWidth="3" />
              <line x1={piece.x + piece.width - 20} y1={piece.y} x2={piece.x + piece.width - 20} y2={piece.y + piece.height} stroke="#334155" strokeWidth="3" />
              {/* Fuel cap */}
              <circle cx={piece.x + piece.width / 2} cy={piece.y + 12} r={6} fill="#EF4444" stroke="#7F1D1D" strokeWidth="2" />
            </>
          )}
        </g>
      );

    case 'dt_cab':
      return (
        <g id={piece.id}>
          {/* Cab Outline */}
          <path
            d={`M ${piece.x} ${piece.y + piece.height} 
               L ${piece.x} ${piece.y + 20} 
               L ${piece.x + 60} ${piece.y} 
               L ${piece.x + piece.width} ${piece.y + 20} 
               L ${piece.x + piece.width} ${piece.y + piece.height} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Windshield */}
              <path
                d={`M ${piece.x + 40} ${piece.y + piece.height - 50} L ${piece.x + 65} ${piece.y + 12} L ${piece.x + piece.width - 15} ${piece.y + 25} L ${piece.x + piece.width - 15} ${piece.y + piece.height - 50} Z`}
                fill="#38BDF8"
                opacity="0.85"
                stroke="#0284C7"
                strokeWidth="2"
              />
              {/* Side window */}
              <rect x={piece.x + 10} y={piece.y + 25} width={26} height={45} rx={4} fill="#38BDF8" opacity="0.85" />
              {/* Door seam & handle */}
              <line x1={piece.x + 36} y1={piece.y + 22} x2={piece.x + 36} y2={piece.y + piece.height} stroke="#C2410C" strokeWidth="3" />
              <rect x={piece.x + 12} y={piece.y + 75} width={14} height={5} rx={2} fill="#1E293B" />
              {/* Headlights */}
              <rect x={piece.x + piece.width - 12} y={piece.y + piece.height - 35} width={10} height={22} rx={3} fill={headlightsOn ? '#FEF08A' : '#CBD5E1'} stroke="#0F172A" strokeWidth="1.5" />
            </>
          )}
        </g>
      );

    case 'dt_visor_horns':
      return (
        <g id={piece.id}>
          {/* Chrome air horns & visor */}
          <path
            d={`M ${piece.x} ${piece.y + 25} L ${piece.x + piece.width} ${piece.y + 25} L ${piece.x + piece.width - 10} ${piece.y + 35} L ${piece.x + 5} ${piece.y + 35} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Air Horns */}
              <path d={`M ${piece.x + 20} ${piece.y + 15} L ${piece.x + 70} ${piece.y + 10} L ${piece.x + 70} ${piece.y + 22} L ${piece.x + 20} ${piece.y + 18} Z`} fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
              {/* Amber clearance lights */}
              {[30, 50, 70, 90].map((lx, i) => (
                <circle key={i} cx={piece.x + lx} cy={piece.y + 28} r={3.5} fill="#FACC15" />
              ))}
            </>
          )}
        </g>
      );

    case 'dt_cylinder':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x + 15}
            y={piece.y}
            width={26}
            height={piece.height}
            rx={8}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <rect x={piece.x + 20} y={piece.y - dumpAngle * 1.2} width={16} height={piece.height} rx={4} fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
          )}
        </g>
      );

    case 'dt_bed':
      return (
        <g
          id={piece.id}
          transform={`rotate(${-dumpAngle}, ${piece.x + 30}, ${piece.y + piece.height - 10})`}
          style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {/* Large Dump Bed Container */}
          <path
            d={`M ${piece.x} ${piece.y + 20} 
               L ${piece.x + 30} ${piece.y} 
               L ${piece.x + piece.width} ${piece.y} 
               L ${piece.x + piece.width - 25} ${piece.y + piece.height} 
               L ${piece.x} ${piece.y + piece.height} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Reinforcing Side Ribs */}
              {[60, 110, 160, 210, 260].map((rx, idx) => (
                <line key={idx} x1={piece.x + rx} y1={piece.y + 15} x2={piece.x + rx - 8} y2={piece.y + piece.height - 10} stroke="#C2410C" strokeWidth="5" strokeLinecap="round" />
              ))}
              {/* Spill protector overhang over cab */}
              <path d={`M ${piece.x + piece.width - 20} ${piece.y} L ${piece.x + piece.width + 30} ${piece.y - 15} L ${piece.x + piece.width + 10} ${piece.y + 10} Z`} fill="#EA580C" stroke="#0F172A" strokeWidth="2" />
            </>
          )}
        </g>
      );

    case 'dt_tailgate':
      return (
        <g
          id={piece.id}
          transform={`rotate(${dumpAngle * 0.7}, ${piece.x + 20}, ${piece.y + 10})`}
          style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={6}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Black & yellow hazard stripes */}
              <g transform={`translate(${piece.x + 5}, ${piece.y + 20})`}>
                <rect width={piece.width - 10} height={piece.height - 40} fill="#FACC15" rx={2} />
                <path d="M 0 10 L 25 35 M 0 35 L 25 60 M 0 60 L 25 85" stroke="#1E293B" strokeWidth="5" />
              </g>
              <circle cx={piece.x + 20} cy={piece.y + 10} r={6} fill="#CBD5E1" stroke="#0F172A" strokeWidth="2" />
            </>
          )}
        </g>
      );

    // ==================== BULLDOZER ====================
    case 'bd_track_frame':
      return (
        <g id={piece.id}>
          {/* Triangular Heavy Track System */}
          <path
            d={`M ${piece.x + 30} ${piece.y + piece.height - 15} 
               L ${piece.x + piece.width - 30} ${piece.y + piece.height - 15} 
               L ${piece.x + piece.width - 50} ${piece.y + 20} 
               L ${piece.x + 60} ${piece.y + 20} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Sprockets & idlers */}
              <circle cx={piece.x + 55} cy={piece.y + 45} r={28} fill="#475569" stroke="#0F172A" strokeWidth="2" />
              <circle cx={piece.x + piece.width - 55} cy={piece.y + 45} r={28} fill="#475569" stroke="#0F172A" strokeWidth="2" />
              {[120, 180, 240, 300].map((bx, idx) => (
                <circle key={idx} cx={piece.x + bx} cy={piece.y + piece.height - 28} r={18} fill="#64748B" stroke="#0F172A" strokeWidth="2" />
              ))}
            </>
          )}
        </g>
      );

    case 'bd_engine':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={10}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Front radiator grille */}
              <rect x={piece.x + piece.width - 25} y={piece.y + 15} width={18} height={piece.height - 30} rx={4} fill="#1E293B" />
              {[25, 45, 65, 85].map((gy, i) => (
                <line key={i} x1={piece.x + piece.width - 22} y1={piece.y + gy} x2={piece.x + piece.width - 10} y2={piece.y + gy} stroke="#CBD5E1" strokeWidth="2" />
              ))}
            </>
          )}
        </g>
      );

    case 'bd_cabin':
      return (
        <g id={piece.id}>
          {/* ROPS Cage & Glass */}
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={12}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              <rect x={piece.x + 15} y={piece.y + 20} width={piece.width - 30} height={piece.height - 50} rx={8} fill="#38BDF8" opacity="0.8" stroke="#0284C7" strokeWidth="2" />
              {/* Heavy ROPS external pillars */}
              <line x1={piece.x + 8} y1={piece.y + 5} x2={piece.x + 8} y2={piece.y + piece.height - 5} stroke="#B45309" strokeWidth="6" strokeLinecap="round" />
              <line x1={piece.x + piece.width - 8} y1={piece.y + 5} x2={piece.x + piece.width - 8} y2={piece.y + piece.height - 5} stroke="#B45309" strokeWidth="6" strokeLinecap="round" />
            </>
          )}
        </g>
      );

    case 'bd_push_arm':
      return (
        <g id={piece.id} transform={`translate(0, ${-bladeLift})`}>
          <path
            d={`M ${piece.x} ${piece.y + 35} L ${piece.x + piece.width} ${piece.y} L ${piece.x + piece.width} ${piece.y + 30} L ${piece.x + 20} ${piece.y + 50} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <circle cx={piece.x + 20} cy={piece.y + 40} r={10} fill="#1E293B" stroke="#CBD5E1" strokeWidth="3" />
          )}
        </g>
      );

    case 'bd_lift_cylinder':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={8}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <line x1={piece.x + 20} y1={piece.y + 15} x2={piece.x + piece.width - 20} y2={piece.y + piece.height - 15} stroke="#F1F5F9" strokeWidth="8" strokeLinecap="round" />
          )}
        </g>
      );

    case 'bd_blade':
      return (
        <g
          id={piece.id}
          transform={`translate(0, ${-bladeLift})`}
          style={{ transition: 'transform 0.3s ease-out' }}
        >
          {/* Curved Heavy Steel Dozer Blade */}
          <path
            d={`M ${piece.x + 10} ${piece.y + 15} 
               C ${piece.x + 70} ${piece.y + 30}, ${piece.x + 70} ${piece.y + 110}, ${piece.x + 15} ${piece.y + piece.height - 15} 
               L ${piece.x + piece.width} ${piece.y + piece.height - 15} 
               L ${piece.x + piece.width - 15} ${piece.y + 15} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Ground Cutting Edge blade plate */}
              <rect x={piece.x + 5} y={piece.y + piece.height - 25} width={piece.width - 10} height={18} fill="#FACC15" stroke="#78350F" strokeWidth="2" rx={2} />
              {/* Heavy bolt rivets */}
              {[20, 45, 70].map((bx, i) => (
                <circle key={i} cx={piece.x + bx} cy={piece.y + piece.height - 16} r={3} fill="#1E293B" />
              ))}
            </>
          )}
        </g>
      );

    case 'bd_ripper':
      return (
        <g id={piece.id}>
          {/* Heavy Claw Ripper */}
          <path
            d={`M ${piece.x + 40} ${piece.y + 10} L ${piece.x + 20} ${piece.y + 70} L ${piece.x} ${piece.y + piece.height} L ${piece.x + 25} ${piece.y + piece.height - 10} L ${piece.x + 55} ${piece.y + 60} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
        </g>
      );

    case 'bd_snorkel':
      return (
        <g id={piece.id}>
          <path
            d={`M ${piece.x + 15} ${piece.y + piece.height} L ${piece.x + 15} ${piece.y + 20} L ${piece.x + 40} ${piece.y + 10} L ${piece.x + 45} ${piece.y + 35} L ${piece.x + 28} ${piece.y + 40} L ${piece.x + 28} ${piece.y + piece.height} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <circle cx={piece.x + 40} cy={piece.y + 22} r={10} fill="#1E293B" />
          )}
        </g>
      );

    // ==================== POLICE CAR ====================
    case 'pc_chassis':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={10}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Dual chrome exhaust tips */}
              <circle cx={piece.x + 15} cy={piece.y + 25} r={5} fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
              <line x1={piece.x + 40} y1={piece.y + 25} x2={piece.x + piece.width - 40} y2={piece.y + 25} stroke="#334155" strokeWidth="4" />
            </>
          )}
        </g>
      );

    case 'pc_body':
      return (
        <g id={piece.id}>
          {/* Aerodynamic Patrol Sedan Body */}
          <path
            d={`M ${piece.x} ${piece.y + piece.height} 
               L ${piece.x + 10} ${piece.y + 45} 
               L ${piece.x + 90} ${piece.y + 45} 
               L ${piece.x + 170} ${piece.y + 10} 
               L ${piece.x + 320} ${piece.y + 10} 
               L ${piece.x + 390} ${piece.y + 48} 
               L ${piece.x + piece.width} ${piece.y + 55} 
               L ${piece.x + piece.width} ${piece.y + piece.height} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* White Door Police Wrap */}
              <rect x={piece.x + 130} y={piece.y + 48} width={170} height={piece.height - 48} fill="#F8FAFC" />
              {/* POLICE Bold Emblem */}
              <text x={piece.x + 215} y={piece.y + 88} fill="#1E3A8A" fontSize="24" fontWeight="900" textAnchor="middle" letterSpacing="3">
                POLICE
              </text>
              <text x={piece.x + 215} y={piece.y + 110} fill="#64748B" fontSize="12" fontWeight="700" textAnchor="middle">
                경찰 · 112
              </text>
              {/* Golden Badge Star */}
              <polygon
                points={`${piece.x + 155},${piece.y + 70} ${piece.x + 160},${piece.y + 82} ${piece.x + 173},${piece.y + 82} ${piece.x + 163},${piece.y + 90} ${piece.x + 167},${piece.y + 102} ${piece.x + 155},${piece.y + 94} ${piece.x + 143},${piece.y + 102} ${piece.x + 147},${piece.y + 90} ${piece.x + 137},${piece.y + 82} ${piece.x + 150},${piece.y + 82}`}
                fill="#FACC15"
                stroke="#B45309"
                strokeWidth="1"
              />
              {/* Rear tail lights */}
              <rect x={piece.x + 2} y={piece.y + 50} width={8} height={24} rx={2} fill="#EF4444" />
            </>
          )}
        </g>
      );

    case 'pc_windows':
      return (
        <g id={piece.id}>
          {/* Windshield & Windows */}
          <path
            d={`M ${piece.x} ${piece.y + piece.height} 
               L ${piece.x + 50} ${piece.y + 5} 
               L ${piece.x + piece.width - 40} ${piece.y + 5} 
               L ${piece.x + piece.width} ${piece.y + piece.height} Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
            opacity={isGhost ? 1 : 0.85}
          />
          {!isGhost && (
            <>
              {/* Center B-Pillar divider */}
              <line x1={piece.x + 110} y1={piece.y + 5} x2={piece.x + 110} y2={piece.y + piece.height} stroke="#0F172A" strokeWidth="6" />
              {/* Window glass glare */}
              <line x1={piece.x + 70} y1={piece.y + 15} x2={piece.x + 95} y2={piece.y + piece.height - 15} stroke="#FFFFFF" strokeWidth="4" opacity="0.6" strokeLinecap="round" />
            </>
          )}
        </g>
      );

    case 'pc_bullbar':
      return (
        <g id={piece.id}>
          {/* Heavy Front Steel Bull Bar */}
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={8}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              <line x1={piece.x + 15} y1={piece.y + 15} x2={piece.x + 15} y2={piece.y + piece.height - 15} stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
              <line x1={piece.x + 35} y1={piece.y + 25} x2={piece.x + 35} y2={piece.y + piece.height - 25} stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
            </>
          )}
        </g>
      );

    case 'pc_lightbar':
      return (
        <g id={piece.id}>
          {/* Dual Color Red / Blue Emergency Lightbar */}
          <rect
            x={piece.x}
            y={piece.y + 15}
            width={piece.width}
            height={piece.height - 15}
            rx={6}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Red side */}
              <rect x={piece.x + 5} y={piece.y + 18} width={piece.width / 2 - 10} height={piece.height - 21} rx={4} fill={sirenActive ? '#EF4444' : '#DC2626'} className={sirenActive ? 'animate-pulse' : ''} />
              {/* Blue side */}
              <rect x={piece.x + piece.width / 2 + 5} y={piece.y + 18} width={piece.width / 2 - 10} height={piece.height - 21} rx={4} fill={sirenActive ? '#3B82F6' : '#2563EB'} className={sirenActive ? 'animate-pulse' : ''} />
              {/* Center siren speaker unit */}
              <rect x={piece.x + piece.width / 2 - 8} y={piece.y + 16} width={16} height={piece.height - 17} fill="#1E293B" rx={2} />
              {/* Siren flashing halo */}
              {sirenActive && (
                <>
                  <circle cx={piece.x + 25} cy={piece.y + 25} r={28} fill="rgba(239, 68, 68, 0.35)" />
                  <circle cx={piece.x + piece.width - 25} cy={piece.y + 25} r={28} fill="rgba(59, 130, 246, 0.35)" />
                </>
              )}
            </>
          )}
        </g>
      );

    case 'pc_spotlight':
      return (
        <g id={piece.id}>
          {/* Spotlight & Antenna */}
          <circle
            cx={piece.x + 15}
            cy={piece.y + 30}
            r={12}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              <line x1={piece.x + 30} y1={piece.y + 45} x2={piece.x + 30} y2={piece.y} stroke="#475569" strokeWidth="2.5" />
              <circle cx={piece.x + 30} cy={piece.y} r={3} fill="#EF4444" />
              {/* Beam */}
              {headlightsOn && (
                <polygon points={`${piece.x + 25},${piece.y + 24} ${piece.x + 90},${piece.y + 10} ${piece.x + 90},${piece.y + 50}`} fill="rgba(254, 240, 138, 0.3)" />
              )}
            </>
          )}
        </g>
      );

    // ==================== FIRE ENGINE ====================
    case 'fe_chassis':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={8}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
        </g>
      );

    case 'fe_cab':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={14}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              <rect x={piece.x + 40} y={piece.y + 20} width={piece.width - 55} height={60} rx={8} fill="#38BDF8" opacity="0.85" stroke="#0284C7" strokeWidth="2" />
              <text x={piece.x + 80} y={piece.y + 115} fill="#FFFFFF" fontSize="18" fontWeight="800">119</text>
            </>
          )}
        </g>
      );

    case 'fe_body':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={8}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Silver roll-up shutter doors */}
              {[20, 105, 190].map((dx, idx) => (
                <rect key={idx} x={piece.x + dx} y={piece.y + 25} width={75} height={piece.height - 40} rx={4} fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
              ))}
              {/* Hose connector valves */}
              <circle cx={piece.x + piece.width - 20} cy={piece.y + piece.height - 25} r={8} fill="#FACC15" stroke="#0F172A" strokeWidth="2" />
            </>
          )}
        </g>
      );

    case 'fe_turntable':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={10}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <circle cx={piece.x + piece.width / 2} cy={piece.y + piece.height / 2} r={14} fill="#1E293B" stroke="#94A3B8" strokeWidth="3" />
          )}
        </g>
      );

    case 'fe_ladder_base':
      return (
        <g
          id={piece.id}
          transform={`rotate(${-ladderAngle}, ${piece.x + 20}, ${piece.y + 40})`}
          style={{ transition: 'transform 0.4s ease' }}
        >
          {/* Silver Telescopic Ladder Base */}
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width + ladderExtend}
            height={piece.height}
            rx={6}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Ladder rungs */}
              {Array.from({ length: 8 }).map((_, i) => (
                <line
                  key={i}
                  x1={piece.x + 20 + i * 32}
                  y1={piece.y + 8}
                  x2={piece.x + 20 + i * 32}
                  y2={piece.y + piece.height - 8}
                  stroke="#64748B"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              ))}
            </>
          )}
        </g>
      );

    case 'fe_water_cannon':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={8}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              {/* Brass high pressure monitor nozzle */}
              <polygon points={`${piece.x + piece.width},${piece.y + 20} ${piece.x + piece.width + 20},${piece.y + 12} ${piece.x + piece.width + 20},${piece.y + 36}`} fill="#FACC15" stroke="#78350F" strokeWidth="2" />
            </>
          )}
        </g>
      );

    case 'fe_siren':
      return (
        <g id={piece.id}>
          <rect
            x={piece.x}
            y={piece.y}
            width={piece.width}
            height={piece.height}
            rx={8}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
          {!isGhost && (
            <>
              <circle cx={piece.x + 25} cy={piece.y + 20} r={12} fill="#EF4444" className={sirenActive ? 'animate-ping' : ''} />
              <circle cx={piece.x + piece.width - 25} cy={piece.y + 20} r={12} fill="#3B82F6" className={sirenActive ? 'animate-ping' : ''} />
            </>
          )}
        </g>
      );

    default:
      return (
        <rect
          x={piece.x}
          y={piece.y}
          width={piece.width}
          height={piece.height}
          rx={8}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
        />
      );
  }
};

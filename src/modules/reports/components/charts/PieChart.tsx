'use client';

/**
 * Componente de gráfico circular usando SVG
 * Platform Web Frontend - Next.js TypeScript
 */

import { PieChartProps } from '@/modules/reports/types';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import React from 'react';

const PieChart: React.FC<PieChartProps> = ({
  data,
  title = 'Gráfico Circular',
  showLegend = true,
}) => {
  const theme = useTheme();
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 20;

  // Calcular ángulos para cada segmento
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90; // Empezar desde arriba

  const segments = data.map((item) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    // Convertir a radianes
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calcular coordenadas del arco
    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    // Flag para arcos grandes (más de 180 grados)
    const largeArcFlag = angle > 180 ? 1 : 0;

    // Path del segmento
    const pathData = [
      `M ${center} ${center}`, // Mover al centro
      `L ${x1} ${y1}`, // Línea al inicio del arco
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Arco
      'Z', // Cerrar path
    ].join(' ');

    return {
      ...item,
      pathData,
      startAngle,
      endAngle,
      midAngle: startAngle + angle / 2,
    };
  });

  return (
    <Card elevation={2}>
      <CardContent>
        {title && (
          <Typography variant="h6" component="h3" gutterBottom align="center">
            {title}
          </Typography>
        )}

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={2}>
          {/* Gráfico SVG */}
          <Box flexShrink={0}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {segments.map((segment, index) => (
                <g key={index}>
                  <path
                    d={segment.pathData}
                    fill={segment.color}
                    stroke="#fff"
                    strokeWidth={2}
                    style={{
                      filter: `drop-shadow(0px 2px 4px rgba(0,0,0,0.1))`,
                      transition: 'all 0.3s ease',
                    }}
                  />
                  {/* Etiqueta de porcentaje en el centro del segmento */}
                  {segment.percentage >= 5 && (
                    <text
                      x={center + radius * 0.7 * Math.cos((segment.midAngle * Math.PI) / 180)}
                      y={center + radius * 0.7 * Math.sin((segment.midAngle * Math.PI) / 180)}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#fff"
                      fontSize="12"
                      fontWeight="bold"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {segment.percentage}%
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </Box>

          {/* Leyenda */}
          {showLegend && (
            <Box flex={1} minWidth={200}>
              <Typography variant="subtitle2" gutterBottom>
                Distribución por tipo
              </Typography>
              {segments.map((segment, index) => (
                <Box key={index} display="flex" alignItems="center" mb={1}>
                  <Box
                    width={16}
                    height={16}
                    bgcolor={segment.color}
                    borderRadius="50%"
                    mr={1}
                    flexShrink={0}
                  />
                  <Typography variant="body2" flex={1}>
                    {segment.label}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" ml={1}>
                    {segment.value} ({segment.percentage}%)
                  </Typography>
                </Box>
              ))}
              <Box mt={2} p={1} bgcolor={theme.palette.grey[50]} borderRadius={1}>
                <Typography variant="body2" fontWeight="bold">
                  Total: {total} usuarios
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PieChart;

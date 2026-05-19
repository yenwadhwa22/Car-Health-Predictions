import React from 'react';
import { Radar, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const RadarChart = ({ probabilities }) => {
  const data = [
    { subject: 'TWF', A: probabilities.TWF, fullMark: 100 },
    { subject: 'HDF', A: probabilities.HDF, fullMark: 100 },
    { subject: 'PWF', A: probabilities.PWF, fullMark: 100 },
    { subject: 'OSF', A: probabilities.OSF, fullMark: 100 },
    { subject: 'RNF', A: probabilities.RNF, fullMark: 100 },
  ];

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(0, 245, 255, 0.2)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-main)', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Probability" dataKey="A" stroke="var(--cyan-primary)" fill="var(--cyan-primary)" fillOpacity={0.5} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--cyan-primary)', borderRadius: '4px' }}
            itemStyle={{ color: 'var(--cyan-primary)' }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;

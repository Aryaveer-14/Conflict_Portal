import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SimulationChart = ({ data }) => {
  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <defs>
            <linearGradient id="oilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF4D4D" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#FF4D4D" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="shipGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#58A6FF" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#58A6FF" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="day" 
            stroke="#484F58" 
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `D${value}`}
            dy={10}
          />
          <YAxis 
            stroke="#484F58" 
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#161B22',
              borderColor: '#21262D',
              borderRadius: '4px',
              color: '#E6EDF3',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
            }}
            itemStyle={{ fontSize: '11px' }}
            labelFormatter={(value) => `Day ${value}`}
            formatter={(value) => [`${value}%`, undefined]}
          />
          <Legend 
            wrapperStyle={{ 
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              color: '#8B949E',
              paddingTop: '10px',
            }}
          />
          <Area 
            type="monotone" 
            dataKey="oil_change_pct" 
            name="OIL PRICE Δ" 
            stroke="#FF4D4D" 
            strokeWidth={2} 
            fill="url(#oilGrad)"
            dot={{ fill: '#FF4D4D', strokeWidth: 0, r: 3 }} 
            activeDot={{ r: 5, stroke: '#FF4D4D', strokeWidth: 2, fill: '#0D1117' }}
          />
          <Area 
            type="monotone" 
            dataKey="shipping_disruption_pct" 
            name="SHIPPING %" 
            stroke="#58A6FF" 
            strokeWidth={2}
            fill="url(#shipGrad)"
            dot={{ fill: '#58A6FF', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, stroke: '#58A6FF', strokeWidth: 2, fill: '#0D1117' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimulationChart;

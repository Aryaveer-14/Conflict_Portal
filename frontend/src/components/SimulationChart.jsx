import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SimulationChart = ({ data }) => {
  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <XAxis 
            dataKey="day" 
            stroke="#8B949E" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `Day ${value}`}
            dy={10}
          />
          <YAxis 
            stroke="#8B949E" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#161B22', borderColor: '#21262D', borderRadius: '8px', color: '#E6EDF3', fontSize: '13px' }}
            itemStyle={{ fontSize: '13px' }}
            labelFormatter={(value) => `Day ${value}`}
            formatter={(value) => [`${value}%`, undefined]}
          />
          <Legend wrapperStyle={{ fontSize: '13px', color: '#8B949E', paddingTop: '10px' }} />
          <Line 
            type="monotone" 
            dataKey="oil_change_pct" 
            name="Oil Price Change" 
            stroke="#E94560" 
            strokeWidth={3} 
            dot={{ fill: '#E94560', strokeWidth: 2, r: 4 }} 
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="shipping_disruption_pct" 
            name="Shipping Disruption" 
            stroke="#58A6FF" 
            strokeWidth={3} 
            dot={{ fill: '#58A6FF', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimulationChart;

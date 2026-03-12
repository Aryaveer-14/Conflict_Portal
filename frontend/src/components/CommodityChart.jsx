import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const commodityData = [
  { date: "Day 1", brent: 80, gas: 3.2 },
  { date: "Day 7", brent: 84, gas: 3.5 },
  { date: "Day 14", brent: 87, gas: 3.7 },
  { date: "Day 21", brent: 90, gas: 4.0 },
  { date: "Day 30", brent: 92, gas: 4.2 }
];

const CommodityChart = () => {
  return (
    <div className="h-[180px] w-full mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={commodityData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <XAxis 
            dataKey="date" 
            stroke="#8B949E" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          {/* Dual Y-Axes to display values of different scales neatly */}
          <YAxis 
            yAxisId="left"
            stroke="#8B949E" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#8B949E" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#161B22', borderColor: '#21262D', borderRadius: '8px', color: '#E6EDF3', fontSize: '12px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#8B949E', paddingTop: '10px' }} />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="brent" 
            name="Brent Oil" 
            stroke="#E94560" 
            strokeWidth={2} 
            dot={false} 
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="gas" 
            name="Natural Gas" 
            stroke="#58A6FF" 
            strokeWidth={2} 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommodityChart;

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const radarData = [
  { system: "Energy", score: 74 },
  { system: "Trade", score: 62 },
  { system: "Food", score: 40 },
  { system: "Finance", score: 50 },
  { system: "Transport", score: 68 }
];

const ImpactRadar = () => {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
          <PolarGrid stroke="#21262D" />
          <PolarAngleAxis 
            dataKey="system" 
            tick={{ fill: '#8B949E', fontSize: 10 }} 
          />
          <Radar
            name="Impact Score"
            dataKey="score"
            stroke="#E94560"
            fill="#E94560"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ImpactRadar;

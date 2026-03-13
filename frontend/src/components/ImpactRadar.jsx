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
    <div className="h-[160px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
          <PolarGrid stroke="#21262D" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="system" 
            tick={{ fill: '#8B949E', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }} 
          />
          <Radar
            name="Impact Score"
            dataKey="score"
            stroke="#FF4D4D"
            fill="#FF4D4D"
            fillOpacity={0.15}
            strokeWidth={1.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ImpactRadar;

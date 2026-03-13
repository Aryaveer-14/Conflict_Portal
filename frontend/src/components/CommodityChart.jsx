import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const commodityData = [
  { date: "D1", brent: 80, gas: 3.2 },
  { date: "D7", brent: 84, gas: 3.5 },
  { date: "D14", brent: 87, gas: 3.7 },
  { date: "D18", brent: 85, gas: 3.9 },
  { date: "D21", brent: 90, gas: 4.0 },
  { date: "D28", brent: 88, gas: 4.1 },
  { date: "D30", brent: 92, gas: 4.2 }
];

const MiniChart = ({ data, dataKey, color, label, value, change }) => (
  <div className="bg-base/60 rounded border border-hover/40 p-2">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] font-mono font-bold text-muted tracking-wider">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-mono font-bold text-primary">{value}</span>
        <span className={`text-[9px] font-mono font-bold ${change >= 0 ? 'text-accent-red' : 'text-accent-green'}`}>
          {change >= 0 ? '▲' : '▼'}{Math.abs(change)}%
        </span>
      </div>
    </div>
    <div className="h-[40px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#grad-${dataKey})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const CommodityChart = () => {
  return (
    <div className="space-y-1.5">
      <MiniChart
        data={commodityData}
        dataKey="brent"
        color="#FF4D4D"
        label="BRENT OIL"
        value="$92.40"
        change={12.5}
      />
      <MiniChart
        data={commodityData}
        dataKey="gas"
        color="#58A6FF"
        label="NAT. GAS"
        value="$4.20"
        change={8.3}
      />
    </div>
  );
};

export default CommodityChart;

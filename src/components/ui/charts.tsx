
import * as React from "react"
import {
  Bar,
  Line,
  Pie,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
} from "recharts"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"

interface ChartProps {
  data: any;
  height?: string;
  width?: string;
  options?: any;
  className?: string;
}

export const BarChart = ({
  data,
  height = "350px",
  width = "100%",
  options,
  className,
}: ChartProps) => {
  if (!data) return null;
  
  return (
    <div style={{ height, width }} className={className}>
      <ChartContainer config={{}}>
        <RechartsBarChart data={data.labels ? formatChartData(data) : data}>
          <ChartTooltip content={<ChartTooltipContent />} />
          {options?.scales?.x?.stacked && <Bar stackId="stack" dataKey="value" />}
          {data.datasets && data.datasets.map((dataset: any, index: number) => (
            <Bar
              key={index}
              name={dataset.label}
              dataKey={`dataset-${index}`}
              fill={dataset.backgroundColor || `hsl(${index * 60}, 70%, 50%)`}
              stroke={dataset.borderColor}
              {...(options?.scales?.x?.stacked ? { stackId: "stack" } : {})}
            />
          ))}
          <ChartLegend content={<ChartLegendContent />} />
        </RechartsBarChart>
      </ChartContainer>
    </div>
  );
};

export const LineChart = ({
  data,
  height = "350px",
  width = "100%",
  options,
  className,
}: ChartProps) => {
  if (!data) return null;
  
  return (
    <div style={{ height, width }} className={className}>
      <ChartContainer config={{}}>
        <RechartsLineChart data={data.labels ? formatChartData(data) : data}>
          <ChartTooltip content={<ChartTooltipContent />} />
          {data.datasets && data.datasets.map((dataset: any, index: number) => (
            <Line
              key={index}
              name={dataset.label}
              type="monotone"
              dataKey={`dataset-${index}`}
              stroke={dataset.borderColor || `hsl(${index * 60}, 70%, 50%)`}
              fill={dataset.backgroundColor || "transparent"}
              dot={true}
              {...(dataset.fill ? { fill: dataset.backgroundColor, fillOpacity: 0.2 } : {})}
            />
          ))}
          <ChartLegend content={<ChartLegendContent />} />
        </RechartsLineChart>
      </ChartContainer>
    </div>
  );
};

export const PieChart = ({
  data,
  height = "350px",
  width = "100%",
  options,
  className,
}: ChartProps) => {
  if (!data) return null;
  
  return (
    <div style={{ height, width }} className={className}>
      <ChartContainer config={{}}>
        <RechartsPieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie
            data={getPieChartData(data)}
            nameKey="name"
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          />
          <ChartLegend 
            verticalAlign={options?.plugins?.legend?.position === "bottom" ? "bottom" : "top"}
            content={<ChartLegendContent />} 
          />
        </RechartsPieChart>
      </ChartContainer>
    </div>
  );
};

// Helper function to format data from Chart.js format to Recharts format
const formatChartData = (data: any) => {
  if (!data.labels || !data.datasets) return data;
  
  return data.labels.map((label: string, idx: number) => {
    const item: Record<string, any> = { name: label };
    
    data.datasets.forEach((dataset: any, datasetIndex: number) => {
      item[`dataset-${datasetIndex}`] = dataset.data[idx];
    });
    
    return item;
  });
};

// Helper function for pie chart data
const getPieChartData = (data: any) => {
  if (!data.labels) return data;

  return data.labels.map((label: string, idx: number) => {
    const dataset = data.datasets[0];
    return {
      name: label,
      value: dataset.data[idx],
      fill: dataset.backgroundColor[idx] || `hsl(${idx * 30}, 70%, 50%)`,
    };
  });
};

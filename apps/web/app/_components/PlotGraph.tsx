"use client";
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

export default function PlotGraph() {
  const [plotData, setPlotData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    Promise.all([
      fetch('/embeddings.json').then(res => res.json()),
      fetch('/embeddings_3d.json').then(res => res.json())
    ])
      .then(([embeddingsData, pcaVectors]) => {
        // Assuming embeddingsData has 'cluster' and 'title' fields
        // and pcaVectors has 'PC1', 'PC2', 'PC3' fields
        const x = pcaVectors.map(point => point.PC1);
        const y = pcaVectors.map(point => point.PC2);
        const z = pcaVectors.map(point => point.PC3);
        const clusters = embeddingsData.map(item => item.cluster);
        const titles = embeddingsData.map(item => item.title);
        const uniqueClusters = [...new Set(clusters)];
        const colorScale = uniqueClusters.map((_, i) =>
          `hsl(${i * 360 / uniqueClusters.length},100%,50%)`
        );
        setPlotData([{
          type: 'scatter3d',
          mode: 'markers',
          x: x,
          y: y,
          z: z,
          text: titles.map((title, i) => `${title}<br>Cluster: ${clusters[i]}`),
          hoverinfo: 'text',
          marker: {
            size: 5,
            color: clusters,
            colorscale: colorScale,
            opacity: 0.8
          }
        }]);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.message);
        setIsLoading(false);
      });
  }, []);
  const layout = {
    scene: {
      xaxis: { title: 'PC1', color: '#00de82' },
      yaxis: { title: 'PC2', color: '#00de82' },
      zaxis: { title: 'PC3', color: '#00de82' }
    },
    width: 600,
    height: 500,
    margin: { r: 20, b: 10, l: 10, t: 40 },
    title: '🐸 PCA Visualization of GitHub Issues',
    paper_bgcolor: '#000000',
    plot_bgcolor: '#000000',
    font: { color: '#00de82' },
  };
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return (
    <div className="text-center margin-auto">
      <Plot
        data={plotData}
        layout={layout}
      />
    </div>
  );
}

import { alpha, useTheme } from '@mui/material/styles';
import useALContext from 'components/hooks/useALContext';
import type { SandboxBody as SandboxData, SandboxProcessItem } from 'components/models/base/result_body';
import { getBackgroundColor, getProcessScore } from 'components/visual/ResultCard/Sandbox/sandbox.utils';
import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';

type ProcessTimelineProps = {
  processes: SandboxProcessItem[];
  body: SandboxData;
  onSelect?: (process: SandboxProcessItem) => void;
  startTime?: string | Date;
  endTime?: string | Date;
  rowHeight?: number;
  verticalMargin?: number;
  opacity?: number;
};

export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({
  processes,
  body,
  onSelect,
  startTime,
  endTime,
  rowHeight = 26,
  verticalMargin = 40,
  opacity = 0.8
}) => {
  const theme = useTheme();
  const { scoreToVerdict } = useALContext();

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(900);

  // Responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentRect.width) setWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!processes || processes.length === 0 || !width) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: verticalMargin, right: 60, bottom: verticalMargin, left: 160 };

    const parseDate = (d?: string | Date | null) => (d ? (d instanceof Date ? d : new Date(d)) : null);

    const machineStart = parseDate(startTime);
    const machineEnd = parseDate(endTime);

    // Normalize process data and compute heuristic colors
    const flatData = processes.map(d => {
      const _start = parseDate(d.start_time) ?? machineStart;
      const _end = parseDate(d.end_time) ?? machineEnd ?? _start;
      const processScore = d.safelisted ? undefined : (getProcessScore(d, body?.signatures) ?? undefined);

      const color =
        getBackgroundColor(theme, scoreToVerdict, processScore, opacity) ?? alpha(theme.palette.grey[500], opacity);

      return { ...d, _start, _end, processScore, color };
    });

    // Build parent-child hierarchy
    const pidMap = new Map(flatData.map(d => [d.pid, d]));
    const childrenMap = new Map<number, SandboxProcessItem[]>();

    flatData.forEach(p => {
      if (p.ppid && pidMap.has(p.ppid)) {
        const arr = childrenMap.get(p.ppid) ?? [];
        arr.push(p);
        childrenMap.set(p.ppid, arr);
      }
    });

    const ordered: SandboxProcessItem[] = [];
    const visit = (node: SandboxProcessItem) => {
      ordered.push(node);
      const kids = childrenMap.get(node.pid ?? -1) ?? [];
      kids.sort((a, b) => a.start_time.localeCompare(b.start_time)).forEach(visit);
    };

    const roots = flatData
      .filter(p => !p.ppid || !pidMap.has(p.ppid))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    roots.forEach(visit);

    const innerHeight = ordered.length * rowHeight;
    const totalHeight = innerHeight + margin.top + margin.bottom;
    svg.attr('height', totalHeight);

    const innerWidth = width - margin.left - margin.right;

    // Scales
    const xDomainStart = machineStart ?? d3.min(flatData, d => d._start) ?? new Date();
    const xDomainEnd = machineEnd ?? d3.max(flatData, d => d._end) ?? new Date();

    const x = d3.scaleTime().domain([xDomainStart, xDomainEnd]).range([0, innerWidth]).nice();

    const y = d3
      .scaleBand()
      .domain(ordered.map(d => String(d.pid)))
      .range([0, innerHeight])
      .padding(0.15);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Axes
    g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(5));

    g.append('g')
      .call(
        d3.axisLeft(y).tickFormat(pid => {
          const proc = flatData.find(d => String(d.pid) === pid);
          return `${proc?.image?.split(/[/\\]/).pop() || '-'} (${pid})`;
        })
      )
      .selectAll('text')
      .style('font-size', 12);

    // Links
    const links = flatData
      .filter(d => d.ppid && pidMap.has(d.ppid))
      .map(d => {
        const parent = pidMap.get(d.ppid);
        if (!parent) return null;

        // Parent bottom-left
        const sourceX = x(parent._start ?? new Date());
        const sourceY = (y(String(parent.pid)) ?? 0) + (y.bandwidth() ?? 0);

        // Child left-middle
        const targetX = x(d._start ?? new Date());
        const targetY = (y(String(d.pid)) ?? 0) + (y.bandwidth() ?? 0) / 2;

        return { sourceX, sourceY, targetX, targetY };
      })
      .filter(Boolean) as { sourceX: number; sourceY: number; targetX: number; targetY: number }[];

    g.selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#888')
      .attr('stroke-width', 1.4)
      .attr('opacity', 0.7)
      .attr('d', d => {
        const curveFactor = 1;
        const deltaY = d.targetY - d.sourceY;
        const controlY1 = d.sourceY + deltaY * curveFactor;
        const controlY2 = d.targetY;

        return `
      M${d.sourceX},${d.sourceY}
      C${d.sourceX},${controlY1}
       ${d.targetX},${controlY2}
       ${d.targetX},${d.targetY}
    `;
      });

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', '#222')
      .style('color', '#fff')
      .style('padding', '6px 10px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Bars
    g.selectAll('.process')
      .data(flatData)
      .enter()
      .append('rect')
      .attr('x', d => x(d._start ?? new Date()))
      .attr('y', d => y(String(d.pid)) ?? 0)
      .attr('width', d => Math.max(1, x(d._end ?? new Date()) - x(d._start ?? new Date())))
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', d => d.color)
      .attr('opacity', opacity)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 1);
        tooltip
          .style('opacity', 0.95)
          .html(
            `<strong>${d.image}</strong><br/>
             PID: ${d.pid}<br/>
             PPID: ${d.ppid ?? '—'}<br/>
             Start: ${d.start_time ?? '—'}<br/>
             End: ${d.end_time ?? '(running)'}`
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 30 + 'px');
      })
      .on('mousemove', event => {
        tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 30 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this).attr('opacity', opacity);
        tooltip.style('opacity', 0);
      })
      .on('click', (_, d) => onSelect?.(d));

    return () => {
      tooltip.remove();
      svg.selectAll('*').remove();
    };
  }, [processes, width, body, scoreToVerdict, theme, onSelect, startTime, endTime, rowHeight, verticalMargin, opacity]);

  return (
    <div ref={containerRef} style={{ width: '100%', overflowX: 'hidden' }}>
      <svg ref={svgRef} width={width} />
    </div>
  );
};

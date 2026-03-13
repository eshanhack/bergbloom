'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  LineData,
  Time,
  ColorType,
  CrosshairMode,
  SeriesMarker,
} from 'lightweight-charts';
import { useChartStore } from '@/lib/stores/chartStore';
import { useConnectionStore } from '@/lib/stores/connectionStore';
import { fetchBinanceKlines, parseBinanceKlineWsMessage } from '@/lib/data/binance';
import { fetchYahooHistorical } from '@/lib/data/yahoo';
import { toBinanceInterval, toYahooInterval, toYahooRange } from '@/lib/utils/intervals';
import { BinanceSocket } from '@/lib/websocket/BinanceSocket';
import { Candle } from '@/lib/data/types';
import { calculateSMA, calculateEMA } from './indicators/movingAverages';
import { calculateBollingerBands } from './indicators/bollingerBands';
import { calculateKeltnerChannels } from './indicators/keltnerChannels';
import { calculateParabolicSAR } from './indicators/parabolicSAR';
import { calculateRSI } from './indicators/rsi';
import { calculateMACD } from './indicators/macd';
import { calculateVolume } from './indicators/volume';

export default function ChartContainer() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<'Line'> | ISeriesApi<'Histogram'>>>(new Map());
  const socketRef = useRef<BinanceSocket | null>(null);
  const candlesRef = useRef<Candle[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [loading, setLoading] = useState(true);

  const { activeTicker, activeAssetClass, activeInterval, indicators } = useChartStore();
  const setBinanceStatus = useConnectionStore((s) => s.setBinanceStatus);
  const setYahooStatus = useConnectionStore((s) => s.setYahooStatus);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0a0a0f' },
        textColor: '#8888a0',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(42, 42, 58, 0.5)' },
        horzLines: { color: 'rgba(42, 42, 58, 0.5)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#555570',
          style: 3,
          width: 1,
          labelBackgroundColor: '#1a1a26',
        },
        horzLine: {
          color: '#555570',
          style: 3,
          width: 1,
          labelBackgroundColor: '#1a1a26',
        },
      },
      rightPriceScale: {
        borderColor: '#2a2a3a',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: '#2a2a3a',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00c853',
      downColor: '#ff1744',
      borderUpColor: '#00c853',
      borderDownColor: '#ff1744',
      wickUpColor: '#00c853',
      wickDownColor: '#ff1744',
    });
    candleSeriesRef.current = candleSeries;

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Clear indicator series helper
  const clearIndicatorSeries = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    indicatorSeriesRef.current.forEach((series) => {
      try { chart.removeSeries(series); } catch {}
    });
    indicatorSeriesRef.current.clear();
  }, []);

  // Apply indicators to chart
  const applyIndicators = useCallback((candles: Candle[]) => {
    const chart = chartRef.current;
    if (!chart || candles.length === 0) return;

    clearIndicatorSeries();

    for (const ind of indicators) {
      if (!ind.enabled) continue;

      if (ind.type === 'volume') {
        const volData = calculateVolume(candles);
        volumeSeriesRef.current?.setData(
          volData.map((v) => ({ time: v.time as Time, value: v.value, color: v.color }))
        );
        continue;
      }

      if (ind.type === 'sma') {
        const data = calculateSMA(candles, ind.params.period);
        const series = chart.addLineSeries({
          color: ind.color || '#4488ff',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        series.setData(data.map((d) => ({ time: d.time as Time, value: d.value })));
        indicatorSeriesRef.current.set(ind.id, series);
      }

      if (ind.type === 'ema') {
        const data = calculateEMA(candles, ind.params.period);
        const series = chart.addLineSeries({
          color: ind.color || '#ff8c00',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        series.setData(data.map((d) => ({ time: d.time as Time, value: d.value })));
        indicatorSeriesRef.current.set(ind.id, series);
      }

      if (ind.type === 'bollingerBands') {
        const data = calculateBollingerBands(candles, ind.params.period, ind.params.stdDev);
        const color = ind.color || '#6366f1';
        const upper = chart.addLineSeries({ color, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
        const middle = chart.addLineSeries({ color, lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
        const lower = chart.addLineSeries({ color, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
        upper.setData(data.map((d) => ({ time: d.time as Time, value: d.upper })));
        middle.setData(data.map((d) => ({ time: d.time as Time, value: d.middle })));
        lower.setData(data.map((d) => ({ time: d.time as Time, value: d.lower })));
        indicatorSeriesRef.current.set(`${ind.id}-upper`, upper);
        indicatorSeriesRef.current.set(`${ind.id}-middle`, middle);
        indicatorSeriesRef.current.set(`${ind.id}-lower`, lower);
      }

      if (ind.type === 'keltnerChannels') {
        const data = calculateKeltnerChannels(candles, ind.params.emaPeriod, ind.params.atrPeriod, ind.params.atrMultiplier);
        const color = ind.color || '#f59e0b';
        const upper = chart.addLineSeries({ color, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
        const middle = chart.addLineSeries({ color, lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false });
        const lower = chart.addLineSeries({ color, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
        upper.setData(data.map((d) => ({ time: d.time as Time, value: d.upper })));
        middle.setData(data.map((d) => ({ time: d.time as Time, value: d.middle })));
        lower.setData(data.map((d) => ({ time: d.time as Time, value: d.lower })));
        indicatorSeriesRef.current.set(`${ind.id}-upper`, upper);
        indicatorSeriesRef.current.set(`${ind.id}-middle`, middle);
        indicatorSeriesRef.current.set(`${ind.id}-lower`, lower);
      }

      if (ind.type === 'parabolicSAR') {
        const data = calculateParabolicSAR(candles, ind.params.afStart, ind.params.afIncrement, ind.params.afMax);
        // Use markers on the candle series for PSAR dots
        const markers: SeriesMarker<Time>[] = data.map((d) => ({
          time: d.time as Time,
          position: d.isBelow ? 'belowBar' : 'aboveBar',
          color: ind.color || '#8b5cf6',
          shape: 'circle',
          size: 0.5,
        }));
        candleSeriesRef.current?.setMarkers(markers);
      }

      if (ind.type === 'rsi') {
        const data = calculateRSI(candles, ind.params.period);
        const series = chart.addLineSeries({
          color: ind.color || '#22d3ee',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: true,
          priceScaleId: 'rsi',
        });
        series.priceScale().applyOptions({
          scaleMargins: { top: 0.8, bottom: 0.0 },
          autoScale: true,
        });
        series.setData(data.map((d) => ({ time: d.time as Time, value: d.value })));
        indicatorSeriesRef.current.set(ind.id, series);
      }

      if (ind.type === 'macd') {
        const data = calculateMACD(candles, ind.params.fast, ind.params.slow, ind.params.signal);
        const macdLine = chart.addLineSeries({
          color: '#4488ff',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          priceScaleId: 'macd',
        });
        const signalLine = chart.addLineSeries({
          color: '#ff8c00',
          lineWidth: 1,
          priceLineVisible: false,
          lastValueVisible: false,
          priceScaleId: 'macd',
        });
        const histogram = chart.addHistogramSeries({
          priceScaleId: 'macd',
        });
        macdLine.priceScale().applyOptions({
          scaleMargins: { top: 0.85, bottom: 0.0 },
          autoScale: true,
        });
        macdLine.setData(data.map((d) => ({ time: d.time as Time, value: d.macd })));
        signalLine.setData(data.map((d) => ({ time: d.time as Time, value: d.signal })));
        histogram.setData(data.map((d) => ({
          time: d.time as Time,
          value: d.histogram,
          color: d.histogram >= 0 ? 'rgba(0, 200, 83, 0.5)' : 'rgba(255, 23, 68, 0.5)',
        })));
        indicatorSeriesRef.current.set(`${ind.id}-macd`, macdLine);
        indicatorSeriesRef.current.set(`${ind.id}-signal`, signalLine);
        indicatorSeriesRef.current.set(`${ind.id}-hist`, histogram);
      }
    }
  }, [indicators, clearIndicatorSeries]);

  // Load data when ticker/interval changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Cleanup previous connections
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    async function loadData() {
      try {
        let candles: Candle[] = [];

        if (activeAssetClass === 'crypto') {
          candles = await fetchBinanceKlines(activeTicker, toBinanceInterval(activeInterval), 500);

          // Setup WebSocket for real-time updates
          const socket = new BinanceSocket((status) => {
            setBinanceStatus(status === 'connected' ? 'connected' : 'disconnected');
          });
          socket.connect(activeTicker, toBinanceInterval(activeInterval));
          socketRef.current = socket;

          let lastThrottle = 0;
          socket.subscribe((data) => {
            const now = Date.now();
            if (now - lastThrottle < 100) return;
            lastThrottle = now;

            const candle = parseBinanceKlineWsMessage(data);
            if (!candle || cancelled) return;

            // Update or append candle
            const existing = candlesRef.current;
            if (existing.length > 0 && existing[existing.length - 1].time === candle.time) {
              existing[existing.length - 1] = candle;
            } else {
              existing.push(candle);
            }
            candlesRef.current = existing;

            candleSeriesRef.current?.update({
              time: candle.time as Time,
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
            });

            // Update volume
            const volColor = candle.close >= candle.open
              ? 'rgba(0, 200, 83, 0.25)'
              : 'rgba(255, 23, 68, 0.25)';
            volumeSeriesRef.current?.update({
              time: candle.time as Time,
              value: candle.volume,
              color: volColor,
            });
          });
        } else {
          // Yahoo Finance data
          const yahooInterval = toYahooInterval(activeInterval);
          const yahooRange = toYahooRange(activeInterval);
          candles = await fetchYahooHistorical(activeTicker, yahooInterval, yahooRange);
          setYahooStatus('connected');

          // Setup polling for Yahoo
          pollingRef.current = setInterval(async () => {
            try {
              const newCandles = await fetchYahooHistorical(activeTicker, yahooInterval, '1d');
              if (newCandles.length > 0 && !cancelled) {
                const lastNew = newCandles[newCandles.length - 1];
                const existing = candlesRef.current;
                if (existing.length > 0 && existing[existing.length - 1].time === lastNew.time) {
                  existing[existing.length - 1] = lastNew;
                } else {
                  existing.push(lastNew);
                }
                candlesRef.current = existing;

                candleSeriesRef.current?.update({
                  time: lastNew.time as Time,
                  open: lastNew.open,
                  high: lastNew.high,
                  low: lastNew.low,
                  close: lastNew.close,
                });
                volumeSeriesRef.current?.update({
                  time: lastNew.time as Time,
                  value: lastNew.volume,
                  color: lastNew.close >= lastNew.open
                    ? 'rgba(0, 200, 83, 0.25)'
                    : 'rgba(255, 23, 68, 0.25)',
                });
                setYahooStatus('connected');
              }
            } catch {
              setYahooStatus('degraded');
            }
          }, 5000);
        }

        if (cancelled) return;

        candlesRef.current = candles;

        // Set candle data
        const candleData: CandlestickData[] = candles.map((c) => ({
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));
        candleSeriesRef.current?.setData(candleData);

        // Apply indicators
        applyIndicators(candles);

        // Fit content
        chartRef.current?.timeScale().fitContent();
        setLoading(false);
      } catch (error) {
        console.error('Failed to load chart data:', error);
        setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [activeTicker, activeAssetClass, activeInterval, applyIndicators, setBinanceStatus, setYahooStatus]);

  // Re-apply indicators when they change
  useEffect(() => {
    if (candlesRef.current.length > 0) {
      applyIndicators(candlesRef.current);
    }
  }, [indicators, applyIndicators]);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-bb-bg-primary">
          <div className="flex flex-col items-center gap-2">
            <div className="w-48 h-2 skeleton" />
            <div className="w-32 h-2 skeleton" />
          </div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}

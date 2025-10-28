import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  chartData: Array<{ time: string; price: number }>;
}

const generateMockData = (): CryptoData[] => {
  const coins = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', basePrice: 43250 },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', basePrice: 2280 },
    { id: 'bnb', name: 'Binance Coin', symbol: 'BNB', basePrice: 320 },
    { id: 'sol', name: 'Solana', symbol: 'SOL', basePrice: 98 },
  ];

  return coins.map(coin => {
    const change24h = (Math.random() - 0.5) * 15;
    const currentPrice = coin.basePrice * (1 + change24h / 100);
    
    const chartData = Array.from({ length: 24 }, (_, i) => {
      const variance = (Math.random() - 0.5) * 0.05;
      const price = currentPrice * (1 + variance);
      return {
        time: `${i}:00`,
        price: parseFloat(price.toFixed(2)),
      };
    });

    return {
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: currentPrice,
      change24h: change24h,
      volume24h: Math.random() * 10000000000,
      marketCap: currentPrice * (Math.random() * 20000000),
      chartData,
    };
  });
};

const Index = () => {
  const [cryptos, setCryptos] = useState<CryptoData[]>(generateMockData());
  const [selectedCrypto, setSelectedCrypto] = useState<string>('btc');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCryptos(prev =>
        prev.map(crypto => {
          const priceChange = (Math.random() - 0.5) * 0.5;
          const newPrice = crypto.price * (1 + priceChange / 100);
          
          const newChartPoint = {
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            price: parseFloat(newPrice.toFixed(2)),
          };

          return {
            ...crypto,
            price: newPrice,
            change24h: crypto.change24h + priceChange,
            chartData: [...crypto.chartData.slice(1), newChartPoint],
          };
        })
      );
      setLastUpdate(new Date());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const selected = cryptos.find(c => c.id === selectedCrypto) || cryptos[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Крипто Монитор</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Icon name="Activity" size={16} className="animate-pulse-glow text-primary" />
              Обновлено: {lastUpdate.toLocaleTimeString('ru-RU')}
            </p>
          </div>
          <Badge variant="outline" className="text-sm px-4 py-2">
            <Icon name="TrendingUp" size={16} className="mr-2" />
            Live
          </Badge>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
          {cryptos.map((crypto, index) => (
            <Card
              key={crypto.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                selectedCrypto === crypto.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCrypto(crypto.id)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{crypto.symbol}</CardTitle>
                  <Badge
                    variant={crypto.change24h >= 0 ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {crypto.change24h >= 0 ? '+' : ''}
                    {crypto.change24h.toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{crypto.name}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{formatPrice(crypto.price)}</p>
                  <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={crypto.chartData.slice(-6)}>
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={crypto.change24h >= 0 ? '#8B5CF6' : '#EF4444'}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="chart" className="w-full animate-fade-in">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <Icon name="LineChart" size={16} />
              График
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2">
              <Icon name="GitCompare" size={16} />
              Сравнение
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selected.name} - 24ч График</span>
                  <Badge variant="outline">{selected.symbol}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selected.chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
                      <XAxis dataKey="time" stroke="#8E9196" />
                      <YAxis stroke="#8E9196" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E2330',
                          border: '1px solid #2A2D3A',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon name="DollarSign" size={16} className="text-primary" />
                    Текущая цена
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatPrice(selected.price)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selected.change24h >= 0 ? '↑' : '↓'} {Math.abs(selected.change24h).toFixed(2)}% за 24ч
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon name="TrendingUp" size={16} className="text-secondary" />
                    Объем 24ч
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatLargeNumber(selected.volume24h)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Торговый объем</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon name="PieChart" size={16} className="text-accent" />
                    Капитализация
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{formatLargeNumber(selected.marketCap)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Рыночная капитализация</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Детальная статистика - {selected.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Максимум 24ч</span>
                    <span className="font-semibold">
                      {formatPrice(Math.max(...selected.chartData.map(d => d.price)))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Минимум 24ч</span>
                    <span className="font-semibold">
                      {formatPrice(Math.min(...selected.chartData.map(d => d.price)))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Средняя цена</span>
                    <span className="font-semibold">
                      {formatPrice(
                        selected.chartData.reduce((sum, d) => sum + d.price, 0) /
                          selected.chartData.length
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-muted-foreground">Волатильность</span>
                    <span className="font-semibold">{Math.abs(selected.change24h).toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compare" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Сравнение монет</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
                      <XAxis dataKey="time" stroke="#8E9196" />
                      <YAxis stroke="#8E9196" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E2330',
                          border: '1px solid #2A2D3A',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      {cryptos.map((crypto, index) => {
                        const colors = ['#8B5CF6', '#0EA5E9', '#10B981', '#F59E0B'];
                        return (
                          <Line
                            key={crypto.id}
                            type="monotone"
                            data={crypto.chartData}
                            dataKey="price"
                            stroke={colors[index]}
                            name={crypto.symbol}
                            strokeWidth={2}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cryptos.map((crypto, index) => (
                <Card key={crypto.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{crypto.name}</span>
                      <Badge variant={crypto.change24h >= 0 ? 'default' : 'destructive'}>
                        {crypto.change24h >= 0 ? '+' : ''}
                        {crypto.change24h.toFixed(2)}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Цена</span>
                        <span className="font-semibold">{formatPrice(crypto.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Объем</span>
                        <span className="font-semibold">{formatLargeNumber(crypto.volume24h)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Капитализация</span>
                        <span className="font-semibold">{formatLargeNumber(crypto.marketCap)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

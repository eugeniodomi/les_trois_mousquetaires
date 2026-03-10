import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Button, Grid, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

// Importe o serviço para buscar um produto por ID
import { getProductById, getProductHistory } from '../services/productService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Paleta de cores para os distribuidores
const COLORS = ['#1976d2', '#dc004e', '#388e3c', '#f57c00', '#9c27b0', '#0288d1', '#c0ca33', '#795548', '#607d8b'];

export default function ProdutosDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [distributors, setDistributors] = useState([]);

  useEffect(() => {
    const loadProductDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getProductById(id);
        setProduct(data);
        
        try {
          const history = await getProductHistory(id);
          
          // Processar os dados para o gráfico interativo com múltiplas linhas
          const processedDataMap = {};
          const uniqueDistributors = new Set();

          history.forEach(item => {
            const dateKey = item.date;
            const distName = item.distributorName;
            
            // Adicionar ao Set de distribuidores únicos
            uniqueDistributors.add(distName);

            if (!processedDataMap[dateKey]) {
              processedDataMap[dateKey] = { date: dateKey };
            }
            
            // Armazenar o preço para aquele distribuidor na data
            processedDataMap[dateKey][distName] = item.price;
            // Armazenar o id da cotação para o clique
            processedDataMap[dateKey][`${distName}_cotacao_id`] = item.cotacao_id;
          });

          // Converter o map em array e ordenar por data
          const chartData = Object.values(processedDataMap).sort((a, b) => new Date(a.date) - new Date(b.date));
          
          setDistributors(Array.from(uniqueDistributors));
          setHistoryData(chartData);
        } catch (historyErr) {
          console.warn('Não foi possível carregar o histórico:', historyErr);
        }
      } catch (err) {
        setError(err.message || 'Ocorreu um erro ao buscar os detalhes do produto.');
      } finally {
        setLoading(false);
      }
    };
    loadProductDetails();
  }, [id]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return (
        <Box sx={{textAlign: 'center', mt: 4}}>
            <Typography variant="h5" color="error">Erro: {error}</Typography>
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/produtos')}
                sx={{ mt: 2 }}
            >
                Voltar para a Lista
            </Button>
        </Box>
    );
  }

  if (!product) {
    return <Typography variant="h5">Produto não encontrado.</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/produtos')}
        >
          Voltar para a Lista
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/produtos/${id}/editar`)} // Rota para futura página de edição
        >
          Editar
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Detalhes do Produto: {product.nome}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ID: {product.id}
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Informações Gerais</Typography>
            <Typography><strong>Nome:</strong> {product.nome || 'N/A'}</Typography>
            <Typography><strong>SKU:</strong> {product.sku || 'N/A'}</Typography>
            <Typography><strong>Categoria:</strong> {product.nome_categoria || 'Não categorizado'}</Typography>
            <Typography><strong>Status:</strong> {product.status || 'N/A'}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Descrição</Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{product.descricao || 'Nenhuma descrição fornecida.'}</Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Histórico de Preços
          </Typography>
          {historyData && historyData.length > 0 ? (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2, display: 'block' }}>
                💡 Dica: Passe o rato sobre os pontos para ver os valores e clique numa bolinha para abrir a cotação completa.
              </Typography>
              <Box sx={{ width: '100%', height: 350, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(tick) => {
                        const d = new Date(tick);
                        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                      }}
                    />
                    <YAxis 
                      tickFormatter={(tick) => `R$ ${Number(tick).toFixed(2)}`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      formatter={(value, name) => {
                        return [`R$ ${Number(value).toFixed(2)}`, name];
                      }}
                      labelFormatter={(label) => {
                        const d = new Date(label);
                        return d.toLocaleDateString('pt-BR');
                      }}
                    />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                    {distributors.map((distName, index) => (
                      <Line 
                        key={distName}
                        type="monotone" 
                        dataKey={distName} 
                        stroke={COLORS[index % COLORS.length]} 
                        activeDot={{ 
                          r: 8, 
                          onClick: (e, payload) => {
                            // Extrair o id da cotação mapeado dinamicamente para este distribuidor
                            const cotacaoId = payload.payload[`${distName}_cotacao_id`];
                            if (cotacaoId) {
                                navigate(`/cotacoes/${cotacaoId}`);
                            }
                          },
                          cursor: 'pointer'
                        }} 
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
              Não há histórico de preços suficiente para este produto.
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

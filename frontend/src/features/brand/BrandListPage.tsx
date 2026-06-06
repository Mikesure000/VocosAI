import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton,
} from '@mui/material';
import { Add, Store, Edit, Delete, Bookmark } from '@mui/icons-material';

interface Brand {
  id: string;
  name: string;
  industry: string;
  products: number;
  tasks: number;
}

export default function BrandListPage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([
    { id: '1', name: '完美日记', industry: '美妆护肤', products: 12, tasks: 5 },
    { id: '2', name: '花西子', industry: '美妆护肤', products: 8, tasks: 3 },
    { id: '3', name: '三顿半', industry: '食品饮料', products: 6, tasks: 2 },
  ]);
  const [form, setForm] = useState({ name: '', industry: '' });

  const handleCreate = () => {
    setBrands([...brands, { id: String(Date.now()), name: form.name, industry: form.industry, products: 0, tasks: 0 }]);
    setDialogOpen(false);
    setForm({ name: '', industry: '' });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={700}>品牌管理</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>添加品牌</Button>
      </Box>

      <Grid container spacing={3}>
        {brands.map((brand) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={brand.id}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
              onClick={() => navigate(`/brands/${brand.id}/knowledge`)}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="h6">{brand.name}</Typography>
                    <Chip label={brand.industry} size="small" variant="outlined" />
                  </Box>
                  <Box display="flex" gap={0.5}>
                    <IconButton size="small"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error"><Delete fontSize="small" /></IconButton>
                  </Box>
                </Box>
                <Box display="flex" gap={3} mt={2}>
                  <Box>
                    <Typography variant="h6">{brand.products}</Typography>
                    <Typography variant="caption" color="text.secondary">产品</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6">{brand.tasks}</Typography>
                    <Typography variant="caption" color="text.secondary">分析任务</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加品牌</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="品牌名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} margin="normal" />
          <TextField fullWidth label="行业" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreate}>添加</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

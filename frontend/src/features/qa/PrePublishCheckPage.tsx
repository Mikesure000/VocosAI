import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Button, Grid, TextField,
  MenuItem, FormControl, InputLabel, Select, Chip, Alert, LinearProgress,
  List, ListItem, ListItemIcon, ListItemText, Table, TableBody, TableCell, TableRow,
} from '@mui/material';
import { ArrowBack, CheckCircle, Cancel, Warning, AutoAwesome } from '@mui/icons-material';

const checkItems = [
  { label: '是否回应核心评论问题', passed: true, comment: '已回应用户价格质疑' },
  { label: '标题是否有效', passed: false, comment: '标题有痛点但缺少核心关键词' },
  { label: '开头是否有钩子', passed: false, comment: '前3秒没有直接回应评论区问题' },
  { label: '卖点是否清晰', passed: true, comment: '卖点表达明确' },
  { label: '证明是否充分', passed: false, comment: '缺少具体对比数据和用户反馈' },
  { label: 'CTA 是否明确', passed: false, comment: '结尾没有评论引导' },
  { label: '平台适配', passed: true, comment: '符合平台表达规范' },
  { label: '合规风险', passed: true, comment: '未发现违规表达' },
  { label: '品牌调性', passed: true, comment: '符合品牌边界' },
  { label: '与生产卡一致性', passed: true, comment: '基本执行了策略卡要求' },
];

export default function PrePublishCheckPage() {
  const { id: projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState('');
  const [platform, setPlatform] = useState('douyin');
  const [checkResult, setCheckResult] = useState<typeof checkItems | null>(null);

  const passedCount = checkResult ? checkResult.filter((c) => c.passed).length : 0;
  const totalCount = checkItems.length;
  const score = Math.round((passedCount / totalCount) * 100);

  const handleCheck = () => {
    if (!draft.trim()) return;
    setCheckResult(checkItems);
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/insights`)}>返回</Button>
        <Typography variant="h4" fontWeight={700}>发布前质检</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>脚本/笔记草稿</Typography>
              <Grid container spacing={2} mb={2}>
                <Grid size={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>平台</InputLabel>
                    <Select value={platform} label="平台" onChange={(e) => setPlatform(e.target.value)}>
                      <MenuItem value="douyin">抖音</MenuItem>
                      <MenuItem value="xiaohongshu">小红书</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder="粘贴你的脚本或笔记草稿..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <Button
                variant="contained"
                startIcon={<AutoAwesome />}
                onClick={handleCheck}
                disabled={!draft.trim()}
                sx={{ mt: 2 }}
              >
                AI 质检
              </Button>
            </CardContent>
          </Card>

          {checkResult && (
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">质检结果</Typography>
                  <Chip
                    label={score >= 70 ? '建议修改后发布' : '不建议发布'}
                    color={score >= 70 ? 'warning' : 'error'}
                  />
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">总体评分</Typography>
                    <Typography variant="body2" fontWeight={700}>{score}/100</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={score}
                    sx={{ height: 8, borderRadius: 4 }}
                    color={score >= 70 ? 'warning' : 'error'}
                  />
                </Box>

                <Table size="small">
                  <TableBody>
                    {checkResult.map((item) => (
                      <TableRow key={item.label}>
                        <TableCell sx={{ width: 40 }}>
                          {item.passed ? <CheckCircle color="success" fontSize="small" /> : <Cancel color="error" fontSize="small" />}
                        </TableCell>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{item.comment}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>修改建议</Typography>
              {!checkResult ? (
                <Typography variant="body2" color="text.secondary">粘贴脚本草稿并点击AI质检后显示建议</Typography>
              ) : (
                <List dense>
                  <ListItem>
                    <ListItemText primary="标题增加「贵在哪里/平替/真实对比」关键词" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="开头直接引用评论区质疑" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="中段加入成分或使用周期对比" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="结尾引导用户评论下一个想看的对比对象" />
                  </ListItem>
                </List>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>质检维度说明</Typography>
              <Typography variant="body2" color="text.secondary">
                系统将从10个维度检查脚本/笔记质量，包括是否回应核心评论问题、标题有效性、钩子设计、卖点清晰度、证明充分性、CTA明确性、平台适配、合规风险、品牌调性和生产卡一致性。
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

"use client";

import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import useSWR from "swr";

import { fetcher } from "@/lib/fetcher";
import type { RanklistEntry } from "@/hooks/useApi";
import type { ApiResponse } from "@/types";

interface RankingClientProps {
  initialList: RanklistEntry[];
}

export default function RankingClient({ initialList }: RankingClientProps) {
  const { data } = useSWR<ApiResponse<RanklistEntry[]>>(
    "/v1/reward/ranklist",
    fetcher,
    { fallbackData: { error: false, data: initialList } },
  );

  const list = data?.data ?? [];

  const rows = [...list]
    .sort((a, b) => b.reward - a.reward)
    .map((item, idx) => ({
      rank: idx + 1,
      nickname: item.is_anonymous ? "匿名用户" : item.nick_name || "匿名用户",
      reward: (item.reward / 100).toFixed(2),
    }));

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        赏金排名
      </Typography>

      {rows.length === 0 ? (
        <Alert severity="info">暂无排名数据</Alert>
      ) : (
        <Card variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={60}>#</TableCell>
                  <TableCell>用户名</TableCell>
                  <TableCell align="right">赏金</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.rank}>
                    <TableCell>
                      {row.rank <= 3 ? (
                        <Chip
                          label={row.rank}
                          size="small"
                          color={
                            row.rank === 1
                              ? "warning"
                              : row.rank === 2
                                ? "default"
                                : "info"
                          }
                          sx={{ fontWeight: 700, minWidth: 28 }}
                        />
                      ) : (
                        row.rank
                      )}
                    </TableCell>
                    <TableCell>{row.nickname}</TableCell>
                    <TableCell align="right">¥{row.reward}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Container>
  );
}

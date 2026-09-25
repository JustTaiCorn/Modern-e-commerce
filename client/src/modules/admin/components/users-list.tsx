'use client';

// ponytail: Danh sách người dùng phía Admin hỗ trợ ID số và format ngày tháng an toàn
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { deleteUser } from '@/modules/admin/actions/delete-user';
import type { User } from '@apps/shared/types';

interface UsersListProps {
  users: User[];
}

export function UsersList({ users }: UsersListProps) {
  const router = useRouter();

  const handleDelete = async (userId: string) => {
    if (!userId) return;
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      const result = await deleteUser(userId);

      if (result.success) {
        toast({
          title: 'Thành công',
          description: result.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description: result.message,
        });
      }
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between p-5">
        <h1 className="text-2xl font-bold">Người dùng</h1>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MÃ</TableHead>
            <TableHead>HỌ TÊN</TableHead>
            <TableHead>EMAIL</TableHead>
            <TableHead>VAI TRÒ</TableHead>
            <TableHead>NGÀY TẠO</TableHead>
            <TableHead className="text-right">THAO TÁC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map(user => {
            const userId = String(user.id || user._id || '');
            const isAdmin =
              user.isAdmin ||
              user.roles?.includes('ADMIN') ||
              (user as any).role === 'ADMIN';

            return (
              <TableRow key={userId}>
                <TableCell className="font-medium">#{userId}</TableCell>
                <TableCell>{user.name || (user as any).username || 'N/A'}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {isAdmin ? (
                    <Badge variant="default">
                      <Shield className="mr-1 h-3 w-3" />
                      Quản trị viên
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <UserIcon className="mr-1 h-3 w-3" />
                      Khách hàng
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/users/${userId}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(userId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

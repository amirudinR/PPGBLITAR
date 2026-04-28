import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Kelas, Generus } from '@/types/admin';

interface ManageStudentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: Kelas | null;
  availableStudents: Generus[];
  enrolledStudents: Generus[];
  studentToAdd: string;
  onStudentToAddChange: (value: string) => void;
  onAddStudent: () => void;
  onRemoveStudent: (studentId: string) => void;
}

export default function ManageStudentsDialog({
  isOpen,
  onClose,
  selectedClass,
  availableStudents,
  enrolledStudents,
  studentToAdd,
  onStudentToAddChange,
  onAddStudent,
  onRemoveStudent
}: ManageStudentsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kelola Siswa di Kelas {selectedClass?.namaKelas}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <Label className="text-lg font-semibold">Tambah Siswa</Label>
            <div className="flex items-center gap-2 mt-2">
              <Select 
                value={studentToAdd} 
                onValueChange={onStudentToAddChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Generus..." />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-48">
                    {availableStudents.map(g => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name} ({g.pendidikan})
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <Button onClick={onAddStudent} disabled={!studentToAdd}>Tambah</Button>
            </div>
          </div>
          <div>
            <Label className="text-lg font-semibold">Siswa Terdaftar ({enrolledStudents.length})</Label>
            <ScrollArea className="h-64 mt-2 rounded-md border p-2">
              {enrolledStudents.length > 0 ? (
                enrolledStudents.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-2 hover:bg-background rounded">
                    <div>
                      <span className="font-medium">{student.name}</span>
                      <Badge variant="outline" className="ml-2 font-normal">{student.pendidikan}</Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => onRemoveStudent(student.id)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Belum ada siswa di kelas ini.</p>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

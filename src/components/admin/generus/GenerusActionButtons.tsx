import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Upload } from 'lucide-react';

interface GenerusActionButtonsProps {
  currentUser: any;
  onDownloadTemplate: () => void;
  onImportExcel: () => void;
  onExportExcel: () => void;
}

export default function GenerusActionButtons({
  currentUser,
  onDownloadTemplate,
  onImportExcel,
  onExportExcel
}: GenerusActionButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onDownloadTemplate}>
        <Download className="w-4 h-4 mr-2" />
        Template
      </Button>
      <Button variant="outline" onClick={onImportExcel}>
        <Upload className="w-4 h-4 mr-2" />
        Import Excel
      </Button>
      <Button variant="outline" onClick={onExportExcel}>
        <Download className="w-4 h-4 mr-2" />
        Export Excel
      </Button>
    </div>
  );
}

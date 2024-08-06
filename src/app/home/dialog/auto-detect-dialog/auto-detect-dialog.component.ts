import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import ComponentItem from 'src/util/component-item';
import OtherCodeItem from 'src/util/other-code-item';

@Component({
  selector: 'app-auto-detect-dialog',
  templateUrl: './auto-detect-dialog.component.html',
  styleUrls: ['./auto-detect-dialog.component.css'],
})
export class AutoDetectDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AutoDetectDialogComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  componentFiles: ComponentItem[] = this.data.componentFiles;
  otherFiles: OtherCodeItem[] = this.data.otherFiles;

  onNoClick(): void {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close({ data: this.data });
  }
}

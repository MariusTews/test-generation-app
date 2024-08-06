import { AfterViewInit, Component, inject } from '@angular/core';
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

  checklist: boolean[] = [];
  returnFiles: any = {};

  constructor() {
    for (
      let i = 0;
      i < this.data.componentFiles.length + this.data.otherFiles.length;
      i++
    ) {
      this.checklist.push(false);
    }
  }

  onNoClick(): void {
    this.dialogRef.close({ data: { componentFiles: [], otherFiles: [] } });
  }

  update(select: boolean, index: number) {
    this.checklist[index] = select;
    this.setSelection();
  }

  setSelection() {
    console.log(this.checklist);
    let i = 0;
    const selectedComponentFiles: ComponentItem[] = [];
    for (let item of this.componentFiles) {
      if (this.checklist[i]) {
        selectedComponentFiles.push(item);
      }
      i++;
    }
    const selectedOtherFiles: OtherCodeItem[] = [];
    for (let item of this.otherFiles) {
      if (this.checklist[i]) {
        selectedOtherFiles.push(item);
      }
      i++;
    }
    this.returnFiles = {
      componentFiles: selectedComponentFiles,
      otherFiles: selectedOtherFiles,
    };
  }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutoDetectDialogComponent } from './auto-detect-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [AutoDetectDialogComponent],
  imports: [CommonModule, MatDialogModule],
})
export class AutoDetectDialogModule {}

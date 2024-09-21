import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { AppRoutingModule } from '../app-routing.module';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    TextFieldModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
  ],
})
export class HomeModule {}

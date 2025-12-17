import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/env/env.local';

import { ContactUsService, ContactUs } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { DigitOnlyDirective } from '../../../core/directives/digit-only';

declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule, DigitOnlyDirective],
  providers: [ContactUsService],
  templateUrl: './contactUs.component.html',
  styleUrls: ['./contactUs.component.css'],
})
export class ContactUsComponent implements OnInit, AfterViewInit {
  contactUsData: ContactUs[] = [];
  
  loading: boolean = false;
  selectedContact: ContactUs | null = null;
  selectedContactForPreview: ContactUs | null = null;
  selectedContactForDetails: ContactUs | null = null;
  contactModal: any;
  imagePreviewModal: any;
  contactDetailsModal: any;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  imageurl = environment.imageUrl;
  formSubmitted: boolean = false;
  
  editContact = {
    _id: '',
    Entityname: '',
    email: '',
    mobile_number: '',
    address: '',
    message: '',
    pic: null as File | null
  };

  constructor(
    private contactUsService: ContactUsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchContactUsData();
  }

  ngAfterViewInit(): void {
    // Initialize modals properly with a delay to ensure DOM is fully loaded
    setTimeout(() => {
      const contactModalElement = document.getElementById('contactModal');
      if (contactModalElement) {
        this.contactModal = new bootstrap.Modal(contactModalElement);
      }
      
      const imagePreviewModalElement = document.getElementById('imagePreviewModal');
      if (imagePreviewModalElement) {
        this.imagePreviewModal = new bootstrap.Modal(imagePreviewModalElement);
      }

      const contactDetailsModalElement = document.getElementById('contactDetailsModal');
      if (contactDetailsModalElement) {
        this.contactDetailsModal = new bootstrap.Modal(contactDetailsModalElement);
      }
    }, 300);
  }

  async fetchContactUsData(): Promise<void> {
    this.loading = true;
    
    try {
      const response = await this.contactUsService.getAllContactUs();
      
      if (response && response.success) {
        this.contactUsData = response.data || [];
      } else {
        this.contactUsData = [];
        swalHelper.showToast(response?.message || 'Failed to fetch contact data', 'error');
      }
      
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching contact us data:', error);
      this.contactUsData = [];
      swalHelper.showToast('Failed to fetch contact data', 'error');
    } finally {
      this.loading = false;
    }
  }

  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        swalHelper.showToast('Please select a valid image file (JPG, PNG, GIF)', 'error');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        swalHelper.showToast('File size should not exceed 5MB', 'error');
        return;
      }

      this.selectedFile = file;
      this.editContact.pic = file;

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  openEditContactModal(contact: ContactUs): void {
    this.selectedContact = contact;
    this.editContact = {
      _id: contact._id,
      Entityname: contact.Entityname,
      email: contact.email,
      mobile_number: contact.mobile_number,
      address: contact.address,
      message: contact.message,
      pic: null
    };
    
    // Set image preview if contact has an image
    if (contact.pic) {
      this.imagePreview = this.getImageUrl(contact.pic);
    } else {
      this.imagePreview = null;
    }
    
    this.formSubmitted = false;
    this.showContactModal();
  }

  openImagePreview(contact: ContactUs): void {
    this.selectedContactForPreview = contact;
    this.showImagePreviewModal();
  }

  viewContactDetails(contact: ContactUs): void {
    this.selectedContactForDetails = contact;
    this.showContactDetailsModal();
  }

  resetForm(): void {
    this.editContact = {
      _id: '',
      Entityname: '',
      email: '',
      mobile_number: '',
      address: '',
      message: '',
      pic: null
    };
    this.selectedFile = null;
    this.imagePreview = null;
    this.formSubmitted = false;
  }
  
  showContactModal(): void {
    // Force detect changes
    this.cdr.detectChanges();
    
    if (this.contactModal) {
      this.contactModal.show();
    } else {
      try {
        const modalElement = document.getElementById('contactModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.contactModal = modalInstance;
          modalInstance.show();
        } else {
          // Fallback to jQuery
          $('#contactModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        // Last resort fallback
        $('#contactModal').modal('show');
      }
    }
  }

  showImagePreviewModal(): void {
    // Force detect changes
    this.cdr.detectChanges();
    
    if (this.imagePreviewModal) {
      this.imagePreviewModal.show();
    } else {
      try {
        const modalElement = document.getElementById('imagePreviewModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.imagePreviewModal = modalInstance;
          modalInstance.show();
        } else {
          // Fallback to jQuery
          $('#imagePreviewModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing image preview modal:', error);
        // Last resort fallback
        $('#imagePreviewModal').modal('show');
      }
    }
  }

  showContactDetailsModal(): void {
    // Force detect changes
    this.cdr.detectChanges();
    
    if (this.contactDetailsModal) {
      this.contactDetailsModal.show();
    } else {
      try {
        const modalElement = document.getElementById('contactDetailsModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.contactDetailsModal = modalInstance;
          modalInstance.show();
        } else {
          // Fallback to jQuery
          $('#contactDetailsModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing contact details modal:', error);
        // Last resort fallback
        $('#contactDetailsModal').modal('show');
      }
    }
  }
  
  closeContactModal(): void {
    if (this.contactModal) {
      this.contactModal.hide();
    } else {
      $('#contactModal').modal('hide');
    }
  }

  async saveContact(form: any): Promise<void> {
    this.formSubmitted = true;
    
    try {
      // Validation checks
      if (!this.editContact.Entityname?.trim()) {
        swalHelper.showToast('Please enter entity name', 'warning');
        return;
      }

      if (!this.editContact.email?.trim()) {
        swalHelper.showToast('Please enter email address', 'warning');
        return;
      }

      // Validate email format
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.editContact.email)) {
        swalHelper.showToast('Please enter a valid email address', 'warning');
        return;
      }

      if (!this.editContact.mobile_number?.trim()) {
        swalHelper.showToast('Please enter mobile number', 'warning');
        return;
      }

      // Validate mobile number (max 10 digits)
      const mobileNumber = this.editContact.mobile_number.trim().replace(/\D/g, ''); // Remove non-digits
      if (mobileNumber.length > 10) {
        swalHelper.showToast('Mobile number should not exceed 10 digits', 'warning');
        return;
      }
      // Update the mobile number to only digits
      this.editContact.mobile_number = mobileNumber;

      this.loading = true;

      // Create the update data object
      const updateData: any = {
        Entityname: this.editContact.Entityname.trim(),
        email: this.editContact.email.trim(),
        mobile_number: this.editContact.mobile_number.trim(),
        address: this.editContact.address?.trim() || '',
        message: this.editContact.message?.trim() || ''
      };

      // If a new image is selected, include it
      if (this.editContact.pic) {
        // For file uploads, you might need to use FormData
        const formData = new FormData();
        formData.append('Entityname', updateData.Entityname);
        formData.append('email', updateData.email);
        formData.append('mobile_number', updateData.mobile_number);
        formData.append('address', updateData.address);
        formData.append('message', updateData.message);
        formData.append('pic', this.editContact.pic);

        const response = await this.contactUsService.updateContactUs(this.editContact._id, formData);
        
        if (response && response.success) {
          swalHelper.showToast('Contact information updated successfully', 'success');
          this.closeContactModal();
          this.fetchContactUsData();
        } else {
          swalHelper.showToast(response?.message || 'Failed to update contact information', 'error');
        }
      } else {
        // No file upload, send regular JSON data
        const response = await this.contactUsService.updateContactUs(this.editContact._id, updateData);
        
        if (response && response.success) {
          swalHelper.showToast('Contact information updated successfully', 'success');
          this.closeContactModal();
          this.fetchContactUsData();
        } else {
          swalHelper.showToast(response?.message || 'Failed to update contact information', 'error');
        }
      }

    } catch (error: any) {
      console.error('Error saving contact:', error);
      swalHelper.showToast(error?.response?.data?.message || error?.message || 'Failed to save contact information', 'error');
    } finally {
      this.loading = false;
    }
  }

  // Helper methods
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    // Adjust this base URL according to your backend configuration
    const baseUrl = this.imageurl; // Change this to your API base URL
    return imagePath.startsWith('http') ? imagePath : baseUrl + imagePath;
  }
}
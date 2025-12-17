import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { EventService, Event, ChapterService, Chapter } from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import * as QRCode from 'qrcode';
import { DigitOnlyDirective } from '../../../core/directives/digit-only';

declare var bootstrap: any;

@Component({
    selector: 'app-events',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, DigitOnlyDirective],
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit, AfterViewInit {
    events: Event[] = [];
    filteredEvents: Event[] = [];
    loading: boolean = false;
    imageurl = environment.imageUrl;
    searchQuery: string = '';
    filterType: 'all' | 'event' | 'meeting' = 'all';
    selectedEvent: Event | null = null;
    eventModal: any;
    mediaModal: any;
    qrCodeModal: any;
    qrCodeSrc: string | null = null;
    qrEventName: string = '';
    chapters: Chapter[] = [];
    selectedChapter: string = 'All';
    isEditMode: boolean = false;
    currentEventId: string | null = null;
    galleryModal: any;
    galleryLoading: boolean = false;
    galleryData: any = null;
    galleryEventName: string = '';
    fullScreenImageModal: any;
    fullScreenImageSrc: string = '';
    eventForm: FormGroup;
    thumbnailFile: File | null = null;
    thumbnailPreview: string | null = null;
    selectedPhotos: File[] = [];
    selectedVideos: File[] = [];

    private searchSubject = new Subject<string>();

    constructor(
        private eventService: EventService,
        private chapterService: ChapterService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder
    ) {
        this.searchSubject.pipe(
            debounceTime(500)
        ).subscribe(() => {
            this.filterEvents();
        });

        this.eventForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            date: ['', Validators.required],
            startTime: [''],
            amount: ['', [Validators.pattern(/^\d{0,7}$/)]],
            endTime: [''],
            mode: ['online'],
            event_or_meeting: ['', Validators.required],
            paid: [false],
            location: ['', [Validators.required, Validators.minLength(3)]],
            chapter_name: ['', Validators.required],
            mapURL: [''],
            details: ['']
        });
    }

    ngOnInit(): void {
        this.fetchEvents();
        this.fetchChapters();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            const eventModalElement = document.getElementById('eventModal');
            if (eventModalElement) {
                this.eventModal = new bootstrap.Modal(eventModalElement);
            } else {
                console.warn('Event modal element not found in the DOM');
            }

            const mediaModalElement = document.getElementById('mediaModal');
            if (mediaModalElement) {
                this.mediaModal = new bootstrap.Modal(mediaModalElement);
            } else {
                console.warn('Media modal element not found in the DOM');
            }

            const qrCodeModalElement = document.getElementById('qrCodeModal');
            if (qrCodeModalElement) {
                this.qrCodeModal = new bootstrap.Modal(qrCodeModalElement);
            } else {
                console.warn('QR Code modal element not found in the DOM');
            }

            const galleryModalElement = document.getElementById('galleryModal');
            if (galleryModalElement) {
                this.galleryModal = new bootstrap.Modal(galleryModalElement);
            } else {
                console.warn('Gallery modal element not found in the DOM');
            }

            const fullScreenImageModalElement = document.getElementById('fullScreenImageModal');
            if (fullScreenImageModalElement) {
                this.fullScreenImageModal = new bootstrap.Modal(fullScreenImageModalElement);
            } else {
                console.warn('Full-screen image modal element not found in the DOM');
            }
        }, 300);
    }

    async fetchEvents(): Promise<void> {
        this.loading = true;
        try {
            const response = await this.eventService.getAllEvents();
            console.log('Fetched Events:', JSON.stringify(response, null, 2));
            this.events = response;
            this.filterEvents();
            this.cdr.detectChanges();
        } catch (error) {
            console.error('Error fetching events:', error);
            swalHelper.showToast('Failed to fetch events', 'error');
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    async fetchChapters(): Promise<void> {
        try {
            this.chapters = await this.chapterService.getAllChaptersForDropdown();
            this.cdr.detectChanges();
        } catch (error) {
            console.error('Error fetching chapters:', error);
            swalHelper.showToast('Failed to fetch chapters', 'error');
        }
    }

    filterEvents(): void {
        let filtered = [...this.events];
        console.log('Filtering Events:', JSON.stringify(filtered, null, 2));

        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(event =>
                event.name.toLowerCase().includes(query)
            );
        }

        if (this.filterType !== 'all') {
            filtered = filtered.filter(event =>
                event.event_or_meeting === this.filterType
            );
        }

        this.filteredEvents = filtered;
        console.log('Filtered Events:', JSON.stringify(this.filteredEvents, null, 2));
        this.cdr.detectChanges();
    }

    onSearch(): void {
        this.searchSubject.next(this.searchQuery);
    }

    onFilterChange(): void {
        this.filterEvents();
    }

    openAddEventModal(): void {
        this.isEditMode = false;
        this.currentEventId = null;
        this.eventForm.reset({
            name: '',
            date: '',
            startTime: '',
            endTime: '',
            amount: '',
            mode: 'online',
            event_or_meeting: '',
            paid: false,
            location: '',
            chapter_name: '',
            mapURL: '',
            details: ''
        });
        this.thumbnailFile = null;
        this.thumbnailPreview = null;
        this.showEventModal();
    }

    openEditEventModal(event: Event): void {
        this.isEditMode = true;
        this.currentEventId = event._id;
        this.eventForm.patchValue({
            name: event.name,
            date: new Date(event.date).toISOString().split('T')[0],
            startTime: event.startTime || '',
            endTime: event.endTime || '',
            mode: event.mode || 'online',
            event_or_meeting: event.event_or_meeting,
            paid: event.paid,
            amount: event.amount ? event.amount.toString() : '',
            location: event.location,
            chapter_name: event.chapter_name || '',
            mapURL: event.mapURL || '',
            details: event.details || ''
        });
        this.thumbnailFile = null;
        this.thumbnailPreview = this.getImagePath(event.thumbnail);
        this.showEventModal();
    }

    showEventModal(): void {
        if (this.eventModal) {
            this.eventModal.show();
        }
    }

    closeEventModal(): void {
        if (this.eventModal) {
            this.eventModal.hide();
        }
    }

    openAddMediaModal(event: Event): void {
        this.selectedEvent = event;
        this.selectedPhotos = [];
        this.selectedVideos = [];
        if (this.mediaModal) {
            this.mediaModal.show();
        }
    }

    closeMediaModal(): void {
        if (this.mediaModal) {
            this.mediaModal.hide();
        }
    }

    async openGalleryModal(event: Event): Promise<void> {
        this.galleryEventName = event.name;
        this.galleryData = null;
        this.galleryLoading = true;

        if (this.galleryModal) {
            this.galleryModal.show();
        }

        try {
            const response = await this.eventService.getEventGallery(event._id);
            if (response && response.success) {
                this.galleryData = response.data;
            } else {
                swalHelper.showToast(response.message || 'Failed to load gallery', 'error');
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
            swalHelper.showToast('Failed to load gallery', 'error');
        } finally {
            this.galleryLoading = false;
            this.cdr.detectChanges();
        }
    }

    openFullScreenImage(index: number): void {
        if (this.galleryData && this.galleryData.media.photos[index]) {
            this.fullScreenImageSrc = this.getImagePath(this.galleryData.media.photos[index]);
            if (this.fullScreenImageModal) {
                this.fullScreenImageModal.show();
            }
        }
    }

    onThumbnailChange(event: any): void {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.thumbnailFile = files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.thumbnailPreview = e.target.result;
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(files[0]);
        }
    }

    onPhotosChange(event: any): void {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.selectedPhotos = Array.from(files);
        }
    }

    onVideosChange(event: any): void {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.selectedVideos = Array.from(files);
        }
    }

    canSaveEvent(): boolean {
        return this.eventForm.valid;
    }

    async saveEvent(): Promise<void> {
        // Validate amount if paid event
        if (this.eventForm.get('paid')?.value) {
            const amountValue = this.eventForm.get('amount')?.value;
            if (!amountValue || amountValue.toString().trim() === '') {
                this.eventForm.get('amount')?.setErrors({ required: true });
                this.eventForm.markAllAsTouched();
                swalHelper.showToast('Amount is required for paid events', 'warning');
                return;
            }
            if (amountValue.toString().length > 7) {
                this.eventForm.get('amount')?.setErrors({ maxlength: { requiredLength: 7, actualLength: amountValue.toString().length } });
                this.eventForm.markAllAsTouched();
                swalHelper.showToast('Amount cannot exceed 7 digits', 'warning');
                return;
            }
        }

        if (!this.canSaveEvent()) {
            this.eventForm.markAllAsTouched();
            swalHelper.showToast('Please fill all required fields correctly', 'warning');
            return;
        }

        try {
            this.loading = true;

            const formData = new FormData();
            Object.keys(this.eventForm.value).forEach(key => {
                if (key === 'paid') {
                    formData.append(key, this.eventForm.get(key)?.value.toString());
                } else if (key === 'amount') {
                    const amountValue = this.eventForm.get(key)?.value;
                    formData.append(key, amountValue ? amountValue.toString() : '0');
                } else if (key === 'chapter_name' && this.eventForm.get(key)?.value === '') {
                    formData.append(key, 'All');
                } else {
                    formData.append(key, this.eventForm.get(key)?.value || '');
                }
            });

            if (this.thumbnailFile) {
                formData.append('thumbnail', this.thumbnailFile as Blob);
            }

            console.log('Sending FormData:');
            for (let pair of (formData as any).entries()) {
                console.log(`${pair[0]}: ${pair[1]}`);
            }

            let response;
            if (this.isEditMode && this.currentEventId) {
                response = await this.eventService.updateEvent(this.currentEventId, formData);
                console.log('Update Event Response:', JSON.stringify(response, null, 2));
                if (response && response.success && response.data) {
                    const index = this.events.findIndex(e => e._id === this.currentEventId);
                    if (index !== -1) {
                        this.events[index] = {
                            ...response.data,
                            name: this.eventForm.get('name')?.value
                        };
                        console.log('Manually updated events array:', JSON.stringify(this.events[index], null, 2));
                        this.filterEvents();
                        this.cdr.detectChanges();
                    }
                }
            } else {
                response = await this.eventService.createEvent(formData);
                console.log('Create Event Response:', JSON.stringify(response, null, 2));
            }

            if (response && response.success) {
                swalHelper.showToast(
                    this.isEditMode ? 'Event updated successfully' : 'Event created successfully',
                    'success'
                );
                this.closeEventModal();
                setTimeout(() => this.fetchEvents(), 0);
            } else {
                swalHelper.showToast(response.message || 'Failed to save event', 'error');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            swalHelper.showToast('Failed to save event', 'error');
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    async deleteEvent(eventId: string): Promise<void> {
        try {
            const confirmed = await swalHelper.confirmation(
                'Are you sure?',
                'Do you want to delete this event? This action cannot be undone.',
                'warning'
            );

            if (confirmed.isConfirmed) {
                try {
                    this.loading = true;
                    const response = await this.eventService.deleteEvent(eventId);

                    if (response && response.success) {
                        swalHelper.showToast('Event deleted successfully', 'success');
                        await this.fetchEvents();
                    } else {
                        swalHelper.showToast(response.message || 'Failed to delete event', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting event:', error);
                    swalHelper.showToast('Failed to delete event', 'error');
                } finally {
                    this.loading = false;
                    this.cdr.detectChanges();
                }
            }
        } catch (error) {
            console.error('Error during confirmation dialog:', error);
            swalHelper.showToast('Something went wrong during confirmation.', 'error');
        }
    }

    async uploadPhotos(): Promise<void> {
        if (!this.selectedEvent || this.selectedPhotos.length === 0) {
            return;
        }

        try {
            this.loading = true;
            const formData = new FormData();
            this.selectedPhotos.forEach(photo => {
                formData.append('photos', photo);
            });

            const response = await this.eventService.addPhotosToEvent(this.selectedEvent._id, formData);

            if (response && response.success) {
                swalHelper.showToast('Photos uploaded successfully', 'success');
                this.selectedPhotos = [];
                await this.fetchEvents();
            } else {
                swalHelper.showToast(response.message || 'Failed to upload photos', 'error');
            }
        } catch (error) {
            console.error('Error uploading photos:', error);
            swalHelper.showToast('Failed to upload photos', 'error');
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    async uploadVideos(): Promise<void> {
        if (!this.selectedEvent || this.selectedVideos.length === 0) {
            return;
        }

        try {
            this.loading = true;
            const formData = new FormData();
            this.selectedVideos.forEach(video => {
                formData.append('videos', video);
            });

            const response = await this.eventService.addVideosToEvent(this.selectedEvent._id, formData);

            if (response && response.success) {
                swalHelper.showToast('Videos uploaded successfully', 'success');
                this.selectedVideos = [];
                await this.fetchEvents();
            } else {
                swalHelper.showToast(response.message || 'Failed to upload videos', 'error');
            }
        } catch (error) {
            console.error('Error uploading videos:', error);
            swalHelper.showToast('Failed to upload videos', 'error');
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    viewEventDetails(event: Event): void {
        console.log('View event details:', event);
        swalHelper.showToast('Event details view not implemented yet', 'info');
    }

    async showQRCode(event: Event): Promise<void> {
        this.qrEventName = event.name;
        this.qrCodeSrc = null;

        if (this.qrCodeModal) {
            this.qrCodeModal.show();
        }

        try {
            const qrData = {
                eventId: event._id,
                event: {
                    _id: event._id,
                    name: event.name,
                    event_or_meeting: event.event_or_meeting,
                    date: event.date,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    mode: event.mode,
                    paid: event.paid,
                    thumbnail: event.thumbnail,
                    photos: event.photos,
                    videos: event.videos,
                    location: event.location,
                    chapter_name: event.chapter_name,
                    createdAt: event.createdAt,
                    __v: event.__v
                }
            };

            this.qrCodeSrc = await QRCode.toDataURL(JSON.stringify(qrData), {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 300,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });

            this.cdr.detectChanges();
        } catch (error) {
            console.error('Error generating QR code:', error);
            swalHelper.showToast('Failed to generate QR code', 'error');
        }
    }

    downloadQRCode(): void {
        if (!this.qrCodeSrc) return;

        const link = document.createElement('a');
        link.href = this.qrCodeSrc;
        link.download = `event-qr-${this.qrEventName.replace(/\s+/g, '-').toLowerCase()}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    getImagePath(path: string): string {
        if (!path) return 'assets/images/placeholder-image.png';

        if (!path.startsWith('http')) {
            return `${this.imageurl}${path.replace(/\\/g, '/')}`;
        }

        return path;
    }

    formatDate(dateString: string): string {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    }
}
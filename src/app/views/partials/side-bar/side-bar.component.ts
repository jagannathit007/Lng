// side-bar.component.ts
import { AppWorker } from './../../../core/workers/app.worker';
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { SideBarService } from './side-bar.service';
import { CommonModule } from '@angular/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { AuthService } from 'src/app/services/auth.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
})
export class SideBarComponent implements OnInit, OnDestroy {
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private storage: AppStorage,
    public authService: AuthService,
    public sideBarService: SideBarService,
    public appWorker: AppWorker,
  ) {}

  isSidebarOpen = false;
  isMobile = false;

  ngOnInit() {
    this.checkScreenSize();
    
    // Ensure sidebar is closed on mobile by default
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }

    // Check current route and auto-open dropdowns
    this.checkAndOpenDropdown();

    // Subscribe to route changes to auto-open dropdowns
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAndOpenDropdown();
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  checkAndOpenDropdown() {
    const currentUrl = this.router.url;
    // Remove leading slash and query params for matching
    const cleanUrl = currentUrl.split('?')[0].replace(/^\//, '');
    
    const reportRoutes = [
      'referralReport',
      'testimonialReport',
      'oneTooneReport',
      'tyfcb',
      'VisitorsReport',
      'askManagement',
      'pointHistory',
      'attendanceRecord',
      'taskHistory',
      'fees'
    ];

    // Check if current route matches any report route
    const isReportRoute = reportRoutes.some(route => cleanUrl === route || cleanUrl.startsWith(route + '/'));

    if (isReportRoute) {
      // Find the index of "Reports Section" in the menu
      const menuList = this.sideBarService.list[0]?.menus || [];
      const reportsSectionIndex = menuList.findIndex((item: any) => 
        item.title === 'Reports Section' && item.hasSubmenu
      );

      if (reportsSectionIndex !== -1) {
        // Auto-open the Reports Section dropdown
        this.sideBarService.activeSubMenuIndex = reportsSectionIndex;
      }
    }

    // Also check for Master Section routes
    const masterRoutes = ['country', 'states', 'city', 'chapter', 'category', 'subcategory'];
    const isMasterRoute = masterRoutes.some(route => cleanUrl === route || cleanUrl.startsWith(route + '/'));

    if (isMasterRoute) {
      const menuList = this.sideBarService.list[0]?.menus || [];
      const masterSectionIndex = menuList.findIndex((item: any) => 
        item.title === 'Master Section' && item.hasSubmenu
      );

      if (masterSectionIndex !== -1) {
        this.sideBarService.activeSubMenuIndex = masterSectionIndex;
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const previousIsMobile = this.isMobile;
    this.isMobile = window.innerWidth < 992;
    
    // Close sidebar when switching to mobile
    if (this.isMobile && !previousIsMobile) {
      this.isSidebarOpen = false;
    }
    
    // Auto-close sidebar when switching from mobile to desktop
    if (!this.isMobile && previousIsMobile) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  logout = async () => {
    let confirm = await swalHelper.confirmation(
      'Logout',
      'Do you really want to logout',
      'question'
    );
    if (confirm.isConfirmed) {
      this.storage.clearAll();
      window.location.href = '/';
    }
  };
}
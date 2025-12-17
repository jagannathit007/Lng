import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SideBarService {
  constructor(private router: Router) {}
  ngOnInit(): void {}

  list: any[] = [
    {
      moduleName: 'Startup Weaver',
      menus: [
        {
          title: 'Dashboard',
          link: 'dashboard',
          icon: 'home',
        },
        {
          title: 'Registeration',
          link: 'registerComponent',
          icon: 'user-plus',
        },
        {
          title: 'All Members',
          link: 'users',
          icon: 'users',
        },
        // {
        //   title: 'Import Users',
        //   link: 'importUsers',
        //   icon: 'file-import',
        // },
        // Master Component Section with Submenu
        {
          title: 'Master Section',
          icon: 'settings',
          hasSubmenu: true,
          menu: [
            {
              title: 'Countries',
              link: 'country',
              icon: 'globe',
            },
            {
              title: 'States',
              link: 'states',
              icon: 'map',
            },
            {
              title: 'Cities',
              link: 'city',
              icon: 'map-pin',
            },
            {
              title: 'Chapter',
              link: 'chapter',
              icon: 'layers',
            },
            {
              title: 'Industries',
              link: 'category',
              icon: 'tag',
            },
            {
              title: 'Categories',
              link: 'subcategory',
              icon: 'list',
            },
            
          ],
        },
        {
          title: 'Banner',
          link: 'banners',
          icon: 'banner',
        },
        {
          title: 'Badges',
          link: 'badges',
          icon: 'award',
        },
        {
          title: 'LeaderBoard',
          link: 'leaderboard',
          icon: 'award',
        },
        {
          title: 'Events',
          link: 'events',
          icon: 'calendar',
        },
        {
          title: 'Pre Participation',
          link: 'participation',
          icon: 'check-circle',
        },{
        title:'task Management',
        link:'taskManagement',
        icon:'check-square'
        },
       
        {
          title: 'Badge Management',
          link: 'badgeManagement',
          icon: 'cog',
        },
        // Reports Section with Submenu (with proper icon and hasSubmenu flag)
        {
          title: 'Reports Section',
          icon: 'file-text',
          hasSubmenu: true,
          menu: [
            
            {
              title: 'Referral Given Report',
              link: 'referralReport',
              icon: 'corner-up-right',
            },
            {
              title: 'Testimonial Report',
              link: 'testimonialReport',
              icon: 'message-square',
            },
            {
              title: 'One To One Report',
              link: 'oneTooneReport',
              icon: 'user-check',
            },
            {
              title: 'Tyfcb Report',
              link: 'tyfcb',
              icon: 'trending-up',
            },
            {
              title: 'Visitors Report',
              link: 'VisitorsReport',
              icon: 'user',
            },
            {
              title: 'Ask Management',
              link: 'askManagement',
              icon: 'question-circle',
            },
            {
              title: 'Points History',
              link: 'pointHistory',
              icon: 'history',
            },
            {
              title: 'Attendance Record',
              link: 'attendanceRecord',
              icon: 'clipboard',
            },
            // {
            //   title: 'task History',
            //   link: 'taskHistory',
            //   icon: 'clipboard',
            // },
            {
              title: 'Fees Record',
              link: 'fees',
              icon: 'credit-card',
            },
          ],
        },
        
        {
          title: 'Complaints',
          link: 'complaints',
          icon: 'exclamation-triangle',
        },
        {
          title: 'Suggestions',
          link: 'suggestions',
          icon: 'lightbulb',
        },
        {
          title: 'Contact Us',
          link: 'contactUs',
          icon: 'envelope',
        },
      ],
    },
  ];

  isMobile: boolean = false;
  activeSubMenuIndex: number | null = null;

  toggleSubMenu(index: number) {
    if (this.activeSubMenuIndex === index) {
      this.activeSubMenuIndex = null;
    } else {
      this.activeSubMenuIndex = index;
    }
  }

  navigateWithQueryParams(submenu: any) {
    this.router.navigate([submenu.link], { queryParams: submenu.queryParams });
  }

  onNavSwitch(item: string) {
    this.router.navigateByUrl(`/${item}`);
  }
}
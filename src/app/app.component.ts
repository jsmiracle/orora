import { Component, AfterViewInit, HostListener } from '@angular/core';
import { faTrashAlt, faCheckCircle, faTimesCircle  } from '@fortawesome/free-regular-svg-icons';
import { faRedoAlt, faSun, faMoon, faCircleHalfStroke, faCheck, faExternalLinkAlt, faDownload, faSearch } from "@fortawesome/free-solid-svg-icons";
import { CookieService } from 'ngx-cookie-service';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { jwtDecode } from "jwt-decode";
import { HttpClient, HttpHeaders } from '@angular/common/http';

import SseService from './sse.service';
import { Formats, Format, Quality } from './formats';
import { Theme, Themes } from './theme';
import AlertService from './alert.service';
import ValidatorService from './validator.service';
import { ChangePasswordDto, CheckVerificationCodeDto, DownloadsHistoryDto, DownloadsHistoryRequestDto, IDownloadWithThumbnail, LoginDto, RegisterDto, SendVerificationCodeDto, UserDto } from './interfaces';
import { ResponsesText } from './enums';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent implements AfterViewInit {
  faTrashAlt = faTrashAlt;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faRedoAlt = faRedoAlt;
  faSun = faSun;
  faMoon = faMoon;
  faCheck = faCheck;
  faCircleHalfStroke = faCircleHalfStroke;
  faDownload = faDownload;
  faExternalLinkAlt = faExternalLinkAlt;
  faSearch = faSearch;

  addUrl: string;
  formats: Format[] = Formats;
  qualities: Quality[];
  quality: string;
  format: string;
  folder: string;
  customNamePrefix: string;
  addInProgress = false;
  themes: Theme[] = Themes;
  activeTheme: Theme;
  customDirs$: Observable<string[]>;
  sseDownloads = []

  isModalOpen = false;
  isVerificationModalOpen = false;
  isSignUpModalOpen = false;
  isMypageModal = false;
  isAccountModalOpen = false;
  isDownloadsModalOpen = false;
  isAccountLoading = false;
  activeTab: string = "mobile";
  hasToken: boolean = false;
  isScrolled = false;
  otpCode: string = "";
  verificationLoading: boolean = false;
  downloadsHistory: DownloadsHistoryDto[] | null = null;
  downloadHistoryPage: number = 1;
  downloadHistoryTotal: number = 0;
  downloadHistoryLimit: number = 5;
  isDownloadHistoryLoading = false;
  downloadHistorySearchTerm: string = '';
  isDownloadHistorySearching = false;

  username: string = "";
  phoneNumber: string = "";
  email: string = "";
  password: string = "";
  confirmPassword: string = "";
  loginEmail: string;
  loginPhoneNumber: string;
  loginPassword: string;
  isPrivacyPolicyAccepted: boolean = false;
  userInfo: UserDto | null = null;
  isPasswordChangeVisible = false;
  oldPassword: string = '';
  newPassword: string = '';
  brands: { image: string, url: string }[] = [
    {
      image: '../assets/brands/agoda.jpg',
      url: 'https://click.linkprice.com/click.php?m=agoda&a=A100692258&l=0000'
    },
    {
      image: '../assets/brands/aliex.png',
      url: 'https://click.dotmap.co.kr/?pf_code=100427109712100780'
    },
    {
      image: '../assets/brands/coupang.jpeg',
      url: 'http://app.ac/2bMz71l13'
    },
    {
      image: '../assets/brands/crocs.jpeg',
      url: 'https://click.linkprice.com/click.php?m=crocskr&a=A100692258&l=0000'
    },
    {
      image: '../assets/brands/emart.jpg',
      url: 'https://click.linkprice.com/click.php?m=emart&a=A100692258&l=0000'
    },
    {
      image: '../assets/brands/gmarket.jpg',
      url: 'ttps://click.linkprice.com/click.php?m=gmarket&a=A100692258&l=0000'
    },
    {
      image: '../assets/brands/hotel.png',
      url: 'https://click.linkprice.com/click.php?m=hotelskr&a=A100692258&l=0000'
    },
    {
      image: '../assets/brands/jejupass.png',
      url: 'https://click.linkprice.com/click.php?m=jejupass&a=A100692258&l=0000'
    },
    {
      image: '../assets/brands/lenovo.jpg',
      url: 'https://click.linkprice.com/click.php?m=lenovo&a=A100692258&l=0000'
    },
    {
      image: '../assets/brands/temu.jpg',
      url: 'https://click.linkprice.com/click.php?m=temu&a=A100692258&l=0000'
    },
    {
      image: '../assets/brands/trip.png',
      url: 'https://click.linkprice.com/click.php?m=ctrip&a=A100692258&l=0000'
    },
  ];
  slideConfig = {
    slidesToShow: 6,
    slidesToScroll: 3,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    responsive: [
      {
        breakpoint: 450,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 1
        }
      }
    ]
  };

  constructor(
    private cookieService: CookieService,
    private http: HttpClient,
    private alertService: AlertService,
    private validatorService: ValidatorService,
    public sseService: SseService
  ) {
    this.format = cookieService.get('metube_format') || 'mp4';
    this.setQualities();
    this.quality = cookieService.get('metube_quality') || 'best';
    const currentURL = getQueryParameter('currentUrl');
    if (currentURL) {
      this.addUrl = currentURL;
    }

    this.activeTheme = this.getPreferredTheme(cookieService);
  }

  ngOnInit() {
    this.checkToken();

    this.sseService.getDownloads().subscribe(downloads => {
      const hasNewChanges = !this.sseService.deepEqual(downloads, this.sseDownloads);
      if (hasNewChanges) {
        this.sseDownloads = downloads.reverse();
      }
    });
  }

  ngAfterViewInit() {}
  
  parseToInt(value: any) {
    return parseInt(value)
  } 

  checkToken() {
    const token = localStorage.getItem('token');
    if(!token) {
      this.hasToken = false;
      return;
    }

    const decoded = jwtDecode(token);
    if(!decoded) {
      localStorage.setItemItem('token', '');
      this.hasToken = false;
      return;
    }

    this.hasToken = true;
  }
  
  openVerificationModal() {
    this.isVerificationModalOpen = true;
  }

  closeVerificationModal(event: MouseEvent) {
    event.stopPropagation();
    this.isVerificationModalOpen = false;
  }

  closeAccountModal(event: MouseEvent) {
    event.stopPropagation();
    this.isAccountModalOpen = false;
  }

  openAccountModal() {
    if (!this.userInfo) {
      this.getUserInfo();
    }

    this.isAccountModalOpen = true;
  }

  openDownloadsModal() {
    this.getDownloadsHistory();
    this.isDownloadsModalOpen = true;
  }

  closeDownloadsModal(event: MouseEvent) {
    event.stopPropagation();
    this.isDownloadsModalOpen = false;

    this.downloadHistorySearchTerm = '';
  }

  togglePasswordChange(): void {
    this.isPasswordChangeVisible = !this.isPasswordChangeVisible;
  }

  onOtpChange(otp: string): void {
    this.otpCode = otp;
  }

  onPageChange(event: number) {
    this.downloadHistoryPage = event;
    this.getDownloadsHistory();
  }

  isSearching() {
    if(this.downloadHistorySearchTerm.length === 0 || this.downloadHistorySearchTerm.trim().length === 0) {
      return false;
    }
    return true;
  }

  async onSearchTermChange(newValue: string) {
    if(newValue.length >= 2) {
      this.downloadHistorySearchTerm = newValue;
      await this.searchDownloadsHistory()
    }

    if(newValue.length === 0 || newValue.trim().length === 0) {
      this.getDownloadsHistory();
    }
  }

  selectFormat(format: string) {
    if (!this.addInProgress && !this.sseService.loading) {
      this.format = format;
      this.formatChanged();
    }
  }

  register() {
    const registrationData: RegisterDto =
      this.activeTab === "mobile"
        ? {
            username: this.username,
            phonenumber: this.phoneNumber,
            password: this.password,
          }
        : {
            username: this.username,
            email: this.email,
            password: this.password,
          };

    if (this.activeTab === "mobile") {
      if (
        !this.validatorService.isValidPhoneNumber(registrationData.phonenumber)
      ) {
        this.alertService.showToast(
          ResponsesText.INVALID_PHONE_NUMBER,
          "warning"
        );
        return;
      }
    } else {
      if (!this.validatorService.isValidEmail(registrationData.email)) {
        this.alertService.showToast(ResponsesText.INVALID_EMAIL, "warning");
        return;
      }
    }

    if (!this.validatorService.isValidUserName(registrationData.username)) {
      this.alertService.showToast(ResponsesText.INVALID_USERNAME, "warning");
      return;
    }

    if (!this.validatorService.isValidPassword(registrationData.password)) {
      this.alertService.showToast(ResponsesText.INVALID_PASSWORD, "warning");
      return;
    }

    if (this.confirmPassword !== registrationData.password) {
      this.alertService.showToast(ResponsesText.PASSWORD_DOES_NOT_MATCH_CONFIRMATION, "warning")
      return;
    }

    if(!this.isPrivacyPolicyAccepted) {
      this.alertService.showToast(
        ResponsesText.PRIVACY_POLICY_NOT_ACCEPTED,
        "warning"
      );
      return;
    }

    const endpoint = environment.apiUrl + "/user/registration";
    this.http
      .post(endpoint, registrationData)
      .pipe(
        tap(() => {
          this.isSignUpModalOpen = false;
          this.alertService.showToast(ResponsesText.SUCCESSFULLY_CREATED_USER, "success");
          this.isSignUpModalOpen = false;
          this.openVerificationModal();
          this.sendVerificationCode().subscribe();
        }),
        catchError(({ error }) => {
          switch (error.status) {
            case 409:
              this.alertService.showToast(
                ResponsesText.USER_ALREADY_EXISTS,
                "warning"
              );
              break;
            case 422:
              this.alertService.showToast(
                ResponsesText.INVALID_DATA,
                "warning"
              );
              break;
            default:
              this.alertService.showToast(
                ResponsesText.UNABLE_TO_CREATE_USER,
                "error"
              );
              this.clearVariables();
          }
          return of(null);
        })
      ).subscribe();
  }

  login() {
    const loginData: LoginDto =
      this.activeTab === "mobile"
        ? { phonenumber: this.phoneNumber, password: this.password }
        : { email: this.email, password: this.password };

    //validate
    if (this.activeTab === "mobile") {
      if (!this.validatorService.isValidPhoneNumber(loginData.phonenumber)) {
        this.alertService.showToast(
          ResponsesText.INVALID_PHONE_NUMBER,
          "warning"
        );
        return;
      }
    } else {
      if (!this.validatorService.isValidEmail(loginData.email)) {
        this.alertService.showToast(ResponsesText.INVALID_EMAIL, "warning");
        return;
      }
    }

    if (!this.validatorService.isValidPassword(loginData.password)) {
      this.alertService.showToast(ResponsesText.INVALID_PASSWORD, "warning");
      return;
    }

    const endpoint = environment.apiUrl + "/user/login";
    this.http
      .post(endpoint, loginData)
      .pipe(
        tap((response: any) => {
          const { status, data } = response;
          localStorage.setItem("token", data.accessToken);
          this.clearVariables();
          this.checkToken();
          this.alertService.showToast(ResponsesText.SUCCESSFULLY_LOGGED_IN, "success");
        }),
        catchError(({ error }) => {
          switch (error.status) {
            case 400:
              this.alertService.showToast(
                ResponsesText.LOGIN_FAILED,
                "error"
              );
              break;
            case 403:
              this.isModalOpen = false;
              this.openVerificationModal();
              this.sendVerificationCode().subscribe();
              break;
            case 404:
              this.alertService.showToast(
                ResponsesText.USER_NOT_FOUND,
                "error"
              );
              break;
            case 422:
              this.alertService.showToast(
                ResponsesText.INVALID_DATA,
                "warning"
              );
              break;
            default:
              this.alertService.showToast(
                ResponsesText.INTERNAL_SERVER_ERROR,
                "error"
              );
              this.clearVariables();
          }
          return of(null);
        })
      )
      .subscribe();
  }

  sendVerificationCode() {
    this.verificationLoading = true;
    const sendVerificationCodeData: SendVerificationCodeDto =
      this.activeTab === "mobile"
        ? { phonenumber: this.phoneNumber }
        : { email: this.email };

    const endpoint = environment.apiUrl + "/user/send-verify-code";
    return this.http.post(endpoint, sendVerificationCodeData).pipe(
      map((response) => {
        return response;
      }),
      catchError(({ error }) => {
        switch (error.status) {
          case 404:
            this.alertService.showToast(
              ResponsesText.USER_NOT_FOUND,
              "error"
            );
            this.clearVariables();
            break;
          case 422:
            this.alertService.showToast(
              ResponsesText.INVALID_DATA,
              "warning"
            );
            this.clearVariables();
            break;
          default:
            this.alertService.showToast(
              ResponsesText.UNABLE_TO_SEND_VERIFICATION_CODE,
              "error"
            );
            this.clearVariables();
        }
        return of(null);
      }),
      finalize(() => {
        this.verificationLoading = false;
      })
    );
  }

  checkVerificationCode() {
    this.verificationLoading = true;
    const checkVerificationCodeData: CheckVerificationCodeDto =
      this.activeTab === "mobile"
        ? { phonenumber: this.phoneNumber, code: +this.otpCode }
        : { email: this.email, code: +this.otpCode };

    if (this.otpCode.length < 5) {
      this.alertService.showToast(ResponsesText.CODE_IS_NOT_FILLED_COMPLETELY, "warning");
      return;
    }

    const endpoint = environment.apiUrl + "/user/verify";
    return this.http.post(endpoint, checkVerificationCodeData).pipe(
      map((response) => {
        return response;
      }),
      catchError(({ error }) => {
        switch (error.status) {
          case 400:
            this.alertService.showToast(
              ResponsesText.INVALID_VERIFICATION_CODE,
              "error"
            );
            break;
          case 404:
            this.alertService.showToast(
              ResponsesText.USER_NOT_FOUND,
              "error"
            );
            this.clearVariables();
            break;
          case 422:
            this.alertService.showToast(
              ResponsesText.INVALID_DATA,
              "warning"
            );
            break;
          default:
            this.alertService.showToast(
              ResponsesText.UNABLE_TO_CHECK_VERIFICATION_CODE,
              "error"
            );
            this.clearVariables();
        }
        return of(null);
      }),
      finalize(() => {
        this.verificationLoading = false;
      })
    );
  }

  verify() {
    const response = this.checkVerificationCode();
    response.subscribe({
      next: (response: any) => {
        localStorage.setItem("token", response.data.accessToken);
        this.clearVariables();
        this.checkToken();
        this.alertService.showAlert('회원가입 완료', 'Orora 회원가입을 환영합니다', 'success');
      },
    });
  }

  getUserInfo() {
    this.isAccountLoading = true;
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = environment.apiUrl + "/user";
    this.http.get(endpoint, { headers }).pipe(
      map((response: any) => {       
        this.userInfo = response.data;
      }),
      catchError(({ error }) => {
        if(error.status === 500) {
          this.alertService.showToast(ResponsesText.UNABLE_TO_GET_USER_INFO, "error");
        } else {
          this.clearUnauthorized();
        }
        return of(null);
      }),
      finalize(() => {
        this.isAccountLoading = false;
      })
    ).subscribe();
  }

  
  changePassword(): void {
    const changePasswordDto: ChangePasswordDto = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    }

    if (!this.validatorService.isValidPassword(changePasswordDto.oldPassword)) {
      this.alertService.showToast(ResponsesText.INVALID_PASSWORD, "warning");
      return;
    }

    if (!this.validatorService.isValidPassword(changePasswordDto.newPassword)) {
      this.alertService.showToast(ResponsesText.INVALID_PASSWORD, "warning");
      return;
    }

    this.isAccountLoading = true;
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = environment.apiUrl + "/user/change-password";
    this.http.post(endpoint, changePasswordDto, { headers }).pipe(
      map(() => {
        this.alertService.showAlert('', '비밀번호가 성공적으로 변경되었습니다', 'success');
        this.clearVariables();
      }),
      catchError(({ error }) => {
        switch (error.status) {
          case 400:
            this.alertService.showToast(
              ResponsesText.INVALID_CURRENT_PASSWORD,
              "error"
            );
            break;
          case 401:
            this.alertService.showToast(
              ResponsesText.UNAUTHORIZED,
              "error"
            );
            this.clearUnauthorized();
            break;
          case 422:
            this.alertService.showToast(
              ResponsesText.INVALID_DATA,
              "warning"
            );
            break;
          default:
            this.alertService.showToast(
              ResponsesText.UNABLE_TO_CHANGE_PASSWORD,
              "error"
            );
            this.clearVariables();
        }
        return of(null);
      }),
      finalize(() => {
        this.isAccountLoading = false;
      })
    ).subscribe();
  }

  addToDownloadsHistory(download: IDownloadWithThumbnail): void {
    if(!this.hasToken) {
      return;
    }

    const { title, format, size, url } = download;

    const downloadHistoryDto: DownloadsHistoryRequestDto = {
      title,
      format,
      size: size || 0,
      url
    }

    const token = localStorage.getItem("token");
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = environment.apiUrl + "/download/create";
    this.http.post(endpoint, downloadHistoryDto, { headers }).pipe(
      catchError(({ error }) => {
        switch (error.status) {
          case 403 | 404:
            this.clearUnauthorized();
            break;
          default:
            this.alertService.showToast(
              ResponsesText.UNABLE_TO_ADD_DOWNLOAD_HISTORY,
              "warning"
            );
        }
        return of(null);
      }),
    ).subscribe();
  }

  getDownloadsHistory() {
    this.isDownloadHistoryLoading = true;
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = {
      page: this.downloadHistoryPage,
      limit: this.downloadHistoryLimit,
    }

    const endpoint = environment.apiUrl + "/download";
    this.http.post(endpoint, body, { headers }).pipe(
      map((response: any) => {
        const { status, data } = response;
        this.downloadsHistory = data.data;
        this.downloadHistoryTotal = data.total;
      }),
      catchError(({ error }) => {
        switch (error.status) {
          case 403 | 404:
            this.clearUnauthorized();
            break;
          default:
            this.alertService.showToast(
              ResponsesText.UNABLE_TO_GET_DOWNLOADS_HISTORY,
              "warning"
            );
        }
        return of(null);
      }),
      finalize(() => {
        this.isDownloadHistoryLoading = false;
      })
    ).subscribe();
  }

  deleteDownloadHistory(id: string) {
    this.isDownloadHistoryLoading = true;
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const body = {
      id
    }

    const endpoint = environment.apiUrl + "/download";
    this.http.delete(endpoint, { headers, body }).pipe(
      map(() => {
        this.getDownloadsHistory();
      }),
      catchError(({ error }) => {
        switch (error.status) {
          case 403 | 404:
            this.clearUnauthorized();
            break;
          default:
            this.alertService.showToast(
              ResponsesText.UNABLE_TO_DELETE_DOWNLOAD_HISTORY,
              "warning"
            );
        }
        return of(null);
      }),
      finalize(() => {
        this.isDownloadHistoryLoading = false;
      })
    ).subscribe();
  }

  async clearAllDownloadsHistory() {
    const result = await this.alertService.showConfirm(
      '정말로 모든 다운로드 기록을 삭제하시겠습니까?',
      '전체 다운로드 기록이 손실됩니다',
      '삭제',
      '취소',
    );

    if(!result) return;

    this.isDownloadHistoryLoading = true;
    const token = localStorage.getItem("token");
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const endpoint = environment.apiUrl + "/download/clear";
    this.http.delete(endpoint, { headers }).pipe(
      map(() => {
        this.getDownloadsHistory();
      }),
      catchError(({ error }) => {
        switch (error.status) {
          case 403 | 404:
            this.clearUnauthorized();
            break;
          default:
            this.alertService.showToast(
              ResponsesText.UNABLE_TO_CLEAR_DOWNLOAD_HISTORY,
              "warning"
            );
        }
        return of(null);
      }),
      finalize(() => {
        this.isDownloadHistoryLoading = false;
      })
    ).subscribe();
  }

  async searchDownloadsHistory() {
    this.downloadHistoryPage = 1;
    this.downloadHistoryTotal = 0;
    this.downloadsHistory = [];
    
    this.isDownloadHistoryLoading = true;
    
    await new Promise(r => setTimeout(r, 500));

    const token = localStorage.getItem("token");
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const body = {
      term: this.downloadHistorySearchTerm
    }

    const endpoint = environment.apiUrl + "/download/search";
    this.http.post(endpoint, body, { headers }).pipe(
      map((response: any) => {
        const { status, data } = response;
        this.downloadsHistory = data;
        this.downloadHistoryTotal = data.length;
      }),
      catchError(({ error }) => {
        switch (error.status) {
          case 403 | 404:
            this.clearUnauthorized();
            break;
          default:
            this.alertService.showToast(
              ResponsesText.UNABLE_TO_CLEAR_DOWNLOAD_HISTORY,
              "warning"
            );
        }
        return of(null);
      }),
      finalize(() => {
        this.isDownloadHistoryLoading = false;
      })
    ).subscribe();
  }
 
  formatDate(dateString: string) {
    const date = new Date(dateString);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  clearUnauthorized() {
    localStorage.setItem('token', '');
    this.clearVariables();
    this.checkToken();
  }

  clearVariables() {
    this.isModalOpen = false;
    this.isSignUpModalOpen = false;
    this.isVerificationModalOpen = false;
    this.username = ""
    this.phoneNumber = "";
    this.email = "";
    this.password = "";
    this.otpCode = "";
    this.activeTab = "mobile";
    this.verificationLoading = false;
    this.isPrivacyPolicyAccepted = false;
    this.oldPassword = "";
    this.newPassword = "";
    this.isAccountModalOpen = false;
    this.isPasswordChangeVisible = false;
  }

  logout() {
    localStorage.setItem("token", "");
    this.hasToken = false;
    this.alertService.showToast(ResponsesText.YOU_HAVE_BEEN_LOGGED_OUT_SUCCESSFULLY, "success");
  }

  deleteVideo(id: string) {
    this.sseService.delete(id);
  }

  qualityChanged() {
    this.cookieService.set('metube_quality', this.quality, { expires: 3650 });
  }

  getPreferredTheme(cookieService: CookieService) {
    let theme = 'auto';
    if (cookieService.check('metube_theme')) {
      theme = cookieService.get('metube_theme');
    }

    return this.themes.find((x) => x.id === theme) ?? this.themes.find((x) => x.id === 'auto');
  }

  setTheme(theme: Theme) {
    this.activeTheme = theme;
    if (theme.id === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-bs-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme.id);
    }
  }

  formatChanged() {
    this.cookieService.set('metube_format', this.format, { expires: 3650 });
    this.setQualities();
  }


  setQualities() {
    this.qualities = this.formats.find((el) => el.id == this.format).qualities;
    const exists = this.qualities.find((el) => el.id === this.quality);
    this.quality = exists ? this.quality : 'best';
  }

  async addDownload(url?: string, quality?: string, format?: string) {
    url = url ?? this.addUrl;
    quality = quality ?? this.quality;
    format = format ?? this.format;
    
    this.addInProgress = true;
    this.sseService.add(url, quality, format);
    this.addInProgress = false;
    this.addUrl = '';
  }


  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal(event: MouseEvent) {
    event.stopPropagation();
    this.isModalOpen = false;
  }

  preventClose(event: MouseEvent) {
    event.stopPropagation();
  }

  openSignUpModal() {
    this.isSignUpModalOpen = true;
  }

  closeSignUpModal(event: Event) {
    this.isSignUpModalOpen = false;
    event.stopPropagation();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    this.isScrolled = scrollTop > 20;
  }

}

function getQueryParameter(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

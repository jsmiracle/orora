export interface LoginDto {
  email?: string;
  phonenumber?: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email?: string;
  phonenumber?: string;
  password: string;
}

export interface SendVerificationCodeDto {
  email?: string;
  phonenumber?: string;
}

export interface CheckVerificationCodeDto {
  email?: string;
  phonenumber?: string;
  code: number;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  phonenumber: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface DownloadsHistoryRequestDto {
  title: string;
  format: string;
  size: number;
  url: string;
}

export interface DownloadsHistoryDto {
  title: string;
  format: string;
  size: number;
  url: string;
  thumbnailUrl: string;
  createdAt: Date;
}
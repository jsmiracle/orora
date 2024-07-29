export enum ResponsesText {
    INVALID_EMAIL = '올바른 이메일을 확인해 주세요',
    INVALID_PASSWORD = '길이: 8-16자. 최소 하나의 대문자, 하나의 소문자, 하나의 특수 문자 (!#$%^&*), 하나의 숫자가 포함되어야 합니다',
    INVALID_USERNAME = '잘못된 사용자 이름입니다',
    INVALID_PHONE_NUMBER = '휴대전화번호가 정확한지 확인해 주세요',
    LOGIN_FAILED = '잘못된 로그인 정보입니다',
    USER_NOT_FOUND = '사용자를 찾을 수 없습니다',
    USER_ALREADY_EXISTS = '사용자가 이미 존재합니다',
    INVALID_DATA = '유효하지 않은 데이터입니다',
    UNABLE_TO_CREATE_USER = '사용자를 생성할 수 없습니다',
    SUCCESSFULLY = '성공적으로 완료되었습니다',
    UNABLE_TO_SEND_VERIFICATION_CODE = '인증 코드를 보낼 수 없습니다. 다른 인증 방법을 시도하세요',
    INVALID_VERIFICATION_CODE = '잘못된 인증 코드입니다',
    UNABLE_TO_CHECK_VERIFICATION_CODE = '인증 코드를 확인할 수 없습니다. 나중에 다시 시도하세요',
    SUCCESSFULLY_LOGGED_IN = '성공적으로 로그인했습니다',
    SUCCESSFULLY_CREATED_USER = '성공적으로 등록되었습니다',
    SUCCESSFULLY_VERIFIED = '성공적으로 인증되었습니다',
    INTERNAL_SERVER_ERROR = '서버 오류입니다. 나중에 다시 시도하세요',
    CODE_IS_NOT_FILLED_COMPLETELY = '인증 코드가 완전히 입력되지 않았습니다',
    PRIVACY_POLICY_NOT_ACCEPTED = '개인정보 보호정책을 수락해야 합니다',
    INVALID_CURRENT_PASSWORD = '잘못된 현재 비밀번호',
    UNABLE_TO_CHANGE_PASSWORD = '비밀번호를 변경할 수 없습니다',
    UNAUTHORIZED = '승인되지 않은',
    UNABLE_TO_GET_USER_INFO = '사용자 정보를 얻을 수 없습니다',
    UNABLE_TO_GET_DOWNLOADS_HISTORY = '다운로드 기록을 가져올 수 없습니다',
    UNABLE_TO_DELETE_DOWNLOAD_HISTORY = '다운로드 기록을 삭제할 수 없습니다',
    YOU_HAVE_BEEN_LOGGED_OUT_SUCCESSFULLY = '성공적으로 로그아웃되었습니다',
    UNABLE_TO_ADD_DOWNLOAD_HISTORY = '다운로드 기록을 추가할 수 없습니다',
    UNABLE_TO_CLEAR_DOWNLOAD_HISTORY = '다운로드 기록을 지울 수 없습니다',
    PASSWORD_DOES_NOT_MATCH_CONFIRMATION = '비밀번호가 확인 내용과 일치하지 않습니다'
}
